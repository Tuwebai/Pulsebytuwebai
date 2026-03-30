// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  DEFAULT_BOOTSTRAP_DAYS,
  MAX_BOOTSTRAP_DAYS,
  SyncGa4MetricsError,
  type SyncRequestBody,
  type SyncRequestContext,
} from './types.ts';

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new SyncGa4MetricsError(500, 'No pudimos preparar la sincronizacion de metricas.', 'ENV_MISSING');
  }
  return value;
}

export function createSupabaseAdminClient() {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function extractBearerToken(authorization: string): string {
  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new SyncGa4MetricsError(401, 'Tu sesion no tiene permisos para sincronizar metricas.', 'UNAUTHORIZED');
  }

  return token;
}

async function readSyncRequest(req: Request): Promise<SyncRequestBody> {
  const contentLength = req.headers.get('content-length');
  if (!req.body || contentLength === '0') {
    return {};
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    throw new SyncGa4MetricsError(415, 'La solicitud de sincronizacion no es valida.', 'UNSUPPORTED_CONTENT_TYPE');
  }

  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    throw new SyncGa4MetricsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_JSON');
  }

  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    throw new SyncGa4MetricsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_PAYLOAD');
  }

  const body = rawBody as Record<string, unknown>;
  const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
  const days = typeof body.days === 'number' ? body.days : undefined;

  if (projectId.length === 0 && typeof body.projectId !== 'undefined') {
    throw new SyncGa4MetricsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_PROJECT_ID');
  }

  if (typeof days !== 'undefined' && (!Number.isInteger(days) || days < 1 || days > MAX_BOOTSTRAP_DAYS)) {
    throw new SyncGa4MetricsError(400, 'La cantidad de dias para sincronizar no es valida.', 'INVALID_DAYS');
  }

  return {
    projectId: projectId || undefined,
    days,
  };
}

export function buildDateWindow(days: number, includeToday: boolean): string[] {
  const today = new Date();
  const dates: string[] = [];
  const startOffset = includeToday ? days - 1 : days;
  const endOffset = includeToday ? 0 : 1;

  for (let offset = startOffset; offset >= endOffset; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

export async function resolveRequestContext(req: Request): Promise<SyncRequestContext> {
  const body = await readSyncRequest(req);
  const authorization = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (authorization && cronSecret && authorization === `Bearer ${cronSecret}`) {
    return {
      mode: 'cron',
      days: 1,
      includeToday: false,
      projectId: body.projectId ?? null,
      canNotify: true,
    };
  }

  if (!authorization) {
    throw new SyncGa4MetricsError(401, 'Tu sesion no tiene permisos para sincronizar metricas.', 'UNAUTHORIZED');
  }

  const adminClient = createSupabaseAdminClient();
  const jwt = extractBearerToken(authorization);
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(jwt);

  if (error || !user?.id) {
    throw new SyncGa4MetricsError(401, 'Tu sesion no tiene permisos para sincronizar metricas.', 'UNAUTHORIZED');
  }

  const projectId = body.projectId?.trim();

  if (!projectId) {
    throw new SyncGa4MetricsError(400, 'Necesitamos saber que proyecto queres sincronizar.', 'PROJECT_ID_REQUIRED');
  }

  const { data: adminUser, error: adminUserError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (adminUserError) {
    throw adminUserError;
  }

  const isAuthorizedAdmin = (adminUser as { role: string | null } | null)?.role === 'admin';

  const { data: project, error: projectError } = await adminClient
    .from('projects')
    .select('id, created_by')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    throw new SyncGa4MetricsError(404, 'No encontramos el proyecto para sincronizar.', 'PROJECT_NOT_FOUND');
  }

  if (!isAuthorizedAdmin && project.created_by !== user.id) {
    throw new SyncGa4MetricsError(403, 'No tenes permisos para sincronizar este proyecto.', 'FORBIDDEN');
  }

  return {
    mode: 'bootstrap',
    days: body.days ?? DEFAULT_BOOTSTRAP_DAYS,
    includeToday: true,
    projectId,
    canNotify: false,
  };
}
