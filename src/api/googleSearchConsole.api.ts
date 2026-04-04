import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import type {
  GoogleSearchConsoleConnectResponse,
  GoogleSearchConsoleConnection,
  GoogleSearchConsoleMetricRow,
} from '@/data/types/google';
import { supabase } from '@/lib/supabase/supabase';

interface GoogleSearchConsoleApiRow {
  id: string;
  project_id: string;
  site_url: string | null;
  property_type: 'domain' | 'url_prefix' | null;
  permission_level: string | null;
  google_account_email: string | null;
  connection_status: GoogleSearchConsoleConnection['connectionStatus'];
  connected_at: string | null;
  last_validated_at: string | null;
  last_sync_error: string | null;
  last_sync_status: 'idle' | 'success' | 'error' | null;
  updated_at: string;
}

interface GoogleSearchConsoleMetricApiRow {
  clicks: number | null;
  ctr: number | null;
  id: string;
  impressions: number | null;
  metric_date: string;
  position: number | null;
  project_id: string;
  property_id: string;
  updated_at: string | null;
}

function mapConnectionRow(row: GoogleSearchConsoleApiRow): GoogleSearchConsoleConnection {
  return {
    id: row.id,
    projectId: row.project_id,
    siteUrl: row.site_url,
    propertyType: row.property_type,
    permissionLevel: row.permission_level,
    googleAccountEmail: row.google_account_email,
    connectionStatus: row.connection_status,
    connectedAt: row.connected_at,
    lastValidatedAt: row.last_validated_at,
    lastSyncError: row.last_sync_error,
    lastSyncStatus: row.last_sync_status,
    updatedAt: row.updated_at,
  };
}

function mapMetricRow(row: GoogleSearchConsoleMetricApiRow): GoogleSearchConsoleMetricRow {
  return {
    clicks: row.clicks ?? 0,
    ctr: row.ctr ?? 0,
    date: row.metric_date,
    id: row.id,
    impressions: row.impressions ?? 0,
    position: row.position ?? 0,
    projectId: row.project_id,
    propertyId: row.property_id,
    updatedAt: row.updated_at,
  };
}

function isConnectResponse(value: unknown): value is GoogleSearchConsoleConnectResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.authorizationUrl === 'string' && payload.authorizationUrl.length > 0;
}

export async function getGoogleSearchConsoleConnection(projectId: string): Promise<GoogleSearchConsoleConnection | null> {
  const { data, error } = await supabase
    .from('search_console_properties')
    .select(
      'id, project_id, site_url, property_type, permission_level, google_account_email, connection_status, connected_at, last_validated_at, last_sync_error, last_sync_status, updated_at',
    )
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) {
    throw new Error('No pudimos consultar el estado de Google en este proyecto.');
  }

  if (!data) {
    return null;
  }

  return mapConnectionRow(data as GoogleSearchConsoleApiRow);
}

export async function getGoogleSearchConsoleMetricsByRange(
  projectId: string,
  from: string,
  to: string,
): Promise<GoogleSearchConsoleMetricRow[]> {
  const { data, error } = await supabase
    .from('search_console_daily_metrics')
    .select('id, project_id, property_id, metric_date, clicks, impressions, ctr, position, updated_at')
    .eq('project_id', projectId)
    .gte('metric_date', from)
    .lte('metric_date', to)
    .order('metric_date', { ascending: true });

  if (error) {
    throw new Error('No pudimos consultar las métricas de Google para este proyecto.');
  }

  return ((data || []) as GoogleSearchConsoleMetricApiRow[]).map(mapMetricRow);
}

export async function startGoogleSearchConsoleConnect(
  projectId: string,
  returnToOrigin: string,
): Promise<GoogleSearchConsoleConnectResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión no está disponible para conectar Google.');
  }

  const { data, error } = await supabase.functions.invoke('google-search-console-connect', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      projectId,
      returnToOrigin,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as { error?: string; message?: string } | null;

      if (error.context.status === 400) {
        throw new Error(payload?.message || 'Necesitamos un proyecto válido para conectar Google.');
      }

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para conectar Google.');
      }

      if (error.context.status === 403) {
        throw new Error('No tenés permisos para conectar Google en este proyecto.');
      }

      if (error.context.status === 404) {
        throw new Error(payload?.message || 'No encontramos el proyecto para conectar Google.');
      }

      if (error.context.status === 409) {
        throw new Error(payload?.message || 'Primero necesitamos una web lista para avanzar con Google.');
      }

      if (error.context.status === 500) {
        throw new Error(payload?.message || 'Falta configurar la conexión segura con Google en el backend.');
      }

      throw new Error(payload?.message || 'No pudimos iniciar la conexión con Google.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la conexión con Google.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función que inicia Google.');
    }

    throw new Error('No pudimos iniciar la conexión con Google.');
  }

  if (!isConnectResponse(data)) {
    throw new Error('La respuesta para conectar Google vino incompleta.');
  }

  return data;
}
