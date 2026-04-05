import {
  createSupabaseAdminClient,
  ensureAuthorizedProject,
} from '../google-search-console-connect/shared.ts';
import {
  DEFAULT_SYNC_DAYS,
  MAX_SYNC_DAYS,
  SyncSearchConsoleError,
} from './types.ts';

const GOOGLE_SEARCH_CONSOLE_DATA_LAG_DAYS = 2;
const DEFAULT_CRON_SYNC_DAYS = 90;

interface SyncSearchConsoleRequestBody {
  days?: number;
  projectId?: string;
}

function getCronSecret() {
  return Deno.env.get('CRON_SECRET') || '';
}

function getSearchConsoleSyncSecret() {
  return Deno.env.get('GOOGLE_SEARCH_CONSOLE_SYNC_SECRET') || '';
}

function hasBearerSecret(req: Request, expectedSecret: string) {
  const authorization = req.headers.get('Authorization') || '';
  const [scheme, token] = authorization.trim().split(/\s+/, 2);
  return Boolean(expectedSecret && scheme?.toLowerCase() === 'bearer' && token === expectedSecret);
}

function hasServiceRoleAuthorization(req: Request) {
  const authorization = req.headers.get('Authorization') || '';
  const apiKey = req.headers.get('apikey') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  return Boolean(
    serviceRoleKey &&
      ((scheme?.toLowerCase() === 'bearer' && token === serviceRoleKey) || apiKey === serviceRoleKey),
  );
}

function normalizeSyncDays(input: unknown) {
  const parsed = typeof input === 'number' ? input : Number(input);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SYNC_DAYS;
  }

  return Math.min(MAX_SYNC_DAYS, Math.max(1, Math.floor(parsed)));
}

export function buildDateWindow(days: number) {
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - GOOGLE_SEARCH_CONSOLE_DATA_LAG_DAYS);
  endDate.setUTCHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const dates: string[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    dates,
    endDate: endDate.toISOString().slice(0, 10),
    startDate: startDate.toISOString().slice(0, 10),
  };
}

export async function resolveRequestContext(req: Request) {
  const body = (await req.json().catch(() => null)) as SyncSearchConsoleRequestBody | null;
  const projectId = body?.projectId?.trim();
  const cronSecret = req.headers.get('x-pulse-cron-secret') || '';
  const syncSecret = req.headers.get('x-google-search-console-sync-secret') || '';
  const cronSecretValue = getCronSecret();
  const syncSecretValue = getSearchConsoleSyncSecret();
  const isInternalRequest =
    (cronSecret && cronSecret === cronSecretValue) ||
    (syncSecret && syncSecret === syncSecretValue) ||
    hasBearerSecret(req, cronSecretValue) ||
    hasBearerSecret(req, syncSecretValue) ||
    hasServiceRoleAuthorization(req);
  const syncDays = normalizeSyncDays(body?.days ?? (isInternalRequest ? DEFAULT_CRON_SYNC_DAYS : DEFAULT_SYNC_DAYS));

  if (isInternalRequest) {
    const supabase = createSupabaseAdminClient();
    if (projectId) {
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, domain, created_by')
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!project?.id || !project.domain) {
        throw new SyncSearchConsoleError(404, 'No encontramos el proyecto para sincronizar Google.', 'PROJECT_NOT_FOUND');
      }

      return {
        projectId: project.id as string,
        syncDays,
      };
    }

    return {
      projectId: null,
      syncDays,
    };
  }

  if (!projectId) {
    throw new SyncSearchConsoleError(400, 'Necesitamos un proyecto válido para sincronizar Google.', 'PROJECT_ID_REQUIRED');
  }

  const { project } = await ensureAuthorizedProject(req, projectId);

  return {
    projectId: project.id,
    syncDays,
  };
}
