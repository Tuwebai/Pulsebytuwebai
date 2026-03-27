import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';

export interface OperationalEventSyncSummary {
  ok: boolean;
  created: number;
  updated: number;
  deleted: number;
  desired: number;
}

function isValidSyncSummary(data: unknown): data is OperationalEventSyncSummary {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.ok === 'boolean'
    && typeof candidate.created === 'number'
    && typeof candidate.updated === 'number'
    && typeof candidate.deleted === 'number'
    && typeof candidate.desired === 'number'
  );
}

export async function syncOperationalEvents(): Promise<OperationalEventSyncSummary> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para actualizar eventos.');
  }

  const { data, error } = await supabase.functions.invoke('sync-operational-events', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error instanceof FunctionsHttpError) {
    if (error.context.status === 401) {
      throw new Error('Tu sesión no tiene permisos para sincronizar eventos.');
    }

    if (error.context.status === 403) {
      throw new Error('Solo un administrador puede sincronizar eventos operativos.');
    }

    throw new Error('El backend no pudo sincronizar los eventos operativos.');
  }

  if (error instanceof FunctionsRelayError) {
    throw new Error('El relay de Supabase rechazó la sincronización de eventos.');
  }

  if (error instanceof FunctionsFetchError) {
    throw new Error('No pudimos conectarnos con la función de sincronización.');
  }

  if (error) {
    throw new Error('No pudimos sincronizar los eventos operativos.');
  }

  if (!isValidSyncSummary(data)) {
    throw new Error('El backend devolvio una respuesta invalida al actualizar eventos.');
  }

  return data;
}
