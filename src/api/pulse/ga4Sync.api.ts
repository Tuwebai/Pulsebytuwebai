import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/data/supabase/client';

interface BootstrapGa4SyncResponse {
  rows_upserted: number;
}

export async function requestPulseGa4BootstrapSync(projectId: string, days = 30): Promise<BootstrapGa4SyncResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesion no esta disponible para sincronizar Pulse.');
  }

  const { data, error } = await supabase.functions.invoke('sync-ga4-metrics', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      projectId,
      days,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as { error?: string; message?: string } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesion no tiene permisos para sincronizar las metricas de Pulse.');
      }

      if (error.context.status === 403) {
        throw new Error('No tenes permisos para sincronizar este proyecto.');
      }

      if (error.context.status === 404 && payload?.error === 'PROJECT_NOT_READY') {
        throw new Error('Todavia no encontramos una propiedad de GA4 activa para este proyecto.');
      }

      if (error.context.status === 500 && payload?.error === 'GA4_CREDENTIALS_MISSING') {
        throw new Error('Falta configurar la conexion real con Google Analytics en el backend.');
      }

      throw new Error(payload?.message || 'No pudimos sincronizar las metricas iniciales de Pulse.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazo la sincronizacion de metricas.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la funcion que sincroniza Google Analytics.');
    }

    throw new Error('No pudimos sincronizar las metricas iniciales de Pulse.');
  }

  const rowsUpserted = typeof (data as { rows_upserted?: unknown } | null)?.rows_upserted === 'number'
    ? (data as { rows_upserted: number }).rows_upserted
    : 0;

  return { rows_upserted: rowsUpserted };
}
