import { createSupabaseAdminClient } from '../google-search-console-connect/shared.ts';
import type {
  SearchConsoleCredentialRow,
  SearchConsoleDailyMetricRow,
  SearchConsolePropertyRow,
} from './types.ts';
import { SyncSearchConsoleError } from './types.ts';

export async function getConnectedProperty(projectId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from('search_console_properties')
    .select('id, project_id, site_url')
    .eq('project_id', projectId)
    .eq('connection_status', 'connected')
    .maybeSingle();

  if (propertyError) {
    throw propertyError;
  }

  if (!property?.id || !property.site_url) {
    throw new SyncSearchConsoleError(
      409,
      'Primero necesitamos una propiedad de Google conectada para sincronizar métricas.',
      'PROPERTY_NOT_CONNECTED',
    );
  }

  const { data: credentials, error: credentialsError } = await supabase
    .from('search_console_credentials')
    .select('refresh_token_ciphertext, refresh_token_iv')
    .eq('project_id', projectId)
    .eq('property_id', property.id)
    .maybeSingle();

  if (credentialsError) {
    throw credentialsError;
  }

  if (!credentials?.refresh_token_ciphertext || !credentials.refresh_token_iv) {
    throw new SyncSearchConsoleError(
      409,
      'La conexión de Google no tiene credenciales activas para sincronizar.',
      'MISSING_CREDENTIALS',
    );
  }

  return {
    credentials: credentials as SearchConsoleCredentialRow,
    property: property as SearchConsolePropertyRow,
    supabase,
  };
}

export async function createSyncRun(projectId: string, propertyId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('search_console_sync_runs')
    .insert({
      project_id: projectId,
      property_id: propertyId,
      sync_status: 'running',
      sync_type: 'daily_metrics',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw error ?? new Error('SYNC_RUN_CREATE_FAILED');
  }

  return data.id as string;
}

export async function finishSyncRun(
  syncRunId: string,
  status: 'success' | 'error',
  rowsWritten: number,
  errorCode: string | null,
  errorMessage: string | null,
  metadata: Record<string, unknown>,
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('search_console_sync_runs')
    .update({
      error_code: errorCode,
      error_message: errorMessage,
      finished_at: new Date().toISOString(),
      metadata,
      rows_written: rowsWritten,
      sync_status: status,
    })
    .eq('id', syncRunId);

  if (error) {
    throw error;
  }
}

export async function updatePropertySyncState(projectId: string, status: 'success' | 'error', errorCode: string | null) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('search_console_properties')
    .update({
      last_sync_error: errorCode,
      last_sync_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', projectId);

  if (error) {
    throw error;
  }
}

export async function upsertDailyMetrics(rows: SearchConsoleDailyMetricRow[]) {
  if (rows.length === 0) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('search_console_daily_metrics').upsert(rows, {
    onConflict: 'project_id,metric_date',
  });

  if (error) {
    throw error;
  }
}
