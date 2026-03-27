// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

export class SyncOperationalEventsError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string,
    public readonly code: string,
  ) {
    super(code);
  }
}

export type EventType =
  | 'payment_pending'
  | 'payment_rejected'
  | 'payment_overdue'
  | 'ticket_critical'
  | 'ticket_sla_breach'
  | 'domain_not_connected'
  | 'ga4_not_connected'
  | 'client_no_pulse_data'
  | 'project_approval_pending'
  | 'onboarding_incomplete';

export interface UserRow {
  id: string;
  role: string | null;
  onboarding_completed: boolean | null;
  website: string | null;
  website_status: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
}

export interface ProjectRow {
  id: string;
  created_by: string | null;
  name: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  domain: string | null;
  ga4_property_id: string | null;
  created_at: string;
}

export interface TicketRow {
  id: string;
  user_id: string | null;
  status: string | null;
  priority: string | null;
  asunto: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  user_id: string | null;
  status: string | null;
  mercadopago_status: string | null;
  description: string | null;
  created_at: string;
}

export interface ManagedEventRecord {
  id: string;
  client_id: string;
  type: EventType;
  status: 'open' | 'in_progress' | 'snoozed' | 'resolved';
  owner_id: string | null;
  source_type: string | null;
  source_id: string | null;
  snoozed_until: string | null;
  updated_at: string;
  created_at: string;
}

export interface ManagedEventInput {
  client_id: string;
  type: EventType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'snoozed' | 'resolved';
  title: string;
  description: string | null;
  impact: string | null;
  suggested_action: string | null;
  owner_id: string | null;
  source_type: 'payment' | 'ticket' | 'project' | 'onboarding' | 'domain' | 'system' | null;
  source_id: string | null;
  snoozed_until?: string | null;
  resolved_at?: string | null;
}

export interface AuthenticatedAdminContext {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  adminUserId: string;
}

export interface SyncOperationalEventsRequest {
  trigger: 'manual_admin_sync';
}

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new SyncOperationalEventsError(500, 'No pudimos preparar la sincronizacion operativa.', 'ENV_MISSING');
  }
  return value;
}

export function createSupabaseAdminClient() {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createSupabaseUserClient(authorization: string) {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_ANON_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
}

export function createRequestAuditId() {
  return crypto.randomUUID();
}

export async function readSyncOperationalEventsRequest(req: Request): Promise<SyncOperationalEventsRequest> {
  const contentLength = req.headers.get('content-length');
  if (!req.body || contentLength === '0') {
    return { trigger: 'manual_admin_sync' };
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    throw new SyncOperationalEventsError(415, 'La solicitud de sincronizacion no es valida.', 'UNSUPPORTED_CONTENT_TYPE');
  }

  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    throw new SyncOperationalEventsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_JSON');
  }

  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    throw new SyncOperationalEventsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_PAYLOAD');
  }

  const trigger = 'trigger' in rawBody ? (rawBody as { trigger?: unknown }).trigger : undefined;

  if (typeof trigger !== 'undefined' && trigger !== 'manual_admin_sync') {
    throw new SyncOperationalEventsError(400, 'La solicitud de sincronizacion no es valida.', 'INVALID_TRIGGER');
  }

  return { trigger: 'manual_admin_sync' };
}

export async function ensureAuthenticatedAdmin(authorization: string): Promise<AuthenticatedAdminContext> {
  const userClient = createSupabaseUserClient(authorization);
  const adminClient = createSupabaseAdminClient();
  const { data: { user }, error } = await userClient.auth.getUser();

  if (error || !user?.id) {
    throw new SyncOperationalEventsError(401, 'Tu sesion no tiene permisos para sincronizar eventos.', 'UNAUTHORIZED');
  }

  const { data: isAdmin, error: adminRpcError } = await userClient.rpc('is_admin');
  if (!adminRpcError && isAdmin === true) {
    return { adminClient, adminUserId: user.id };
  }

  const { data: adminUser, error: adminUserError } = await adminClient
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (adminUserError) throw adminUserError;
  if ((adminUser as { role: string | null } | null)?.role !== 'admin') {
    throw new SyncOperationalEventsError(403, 'Solo un administrador puede sincronizar eventos operativos.', 'FORBIDDEN');
  }

  return { adminClient, adminUserId: user.id };
}

export function logSyncOperationalEventsError(params: {
  requestId: string;
  adminUserId: string | null;
  error: unknown;
}) {
  const message = params.error instanceof Error ? params.error.message : 'Unknown error';
  console.error('[sync-operational-events]', {
    request_id: params.requestId,
    admin_user_id: params.adminUserId,
    error_message: message,
  });
}

export function buildEventKey(event: Pick<ManagedEventInput, 'client_id' | 'type' | 'source_type' | 'source_id'>) {
  return [event.client_id, event.type, event.source_type ?? 'none', event.source_id ?? 'none'].join('::');
}

export function buildLatestProjectMap(projects: ProjectRow[]) {
  const map = new Map<string, ProjectRow>();
  projects.forEach((project) => {
    if (!project.created_by || map.has(project.created_by)) return;
    map.set(project.created_by, project);
  });
  return map;
}

export function normalizeStatus(status: string | null) {
  return (status ?? '').toLowerCase();
}

export function normalizePriority(priority: string | null) {
  return (priority ?? '').toLowerCase();
}

export function getPersistedStatus(existingEvent?: ManagedEventRecord) {
  if (existingEvent?.status === 'in_progress' || existingEvent?.status === 'snoozed') {
    return existingEvent.status;
  }
  return 'open' as const;
}
