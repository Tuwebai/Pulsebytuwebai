import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';

export async function syncOperationalEvents(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para actualizar eventos.');
  }

  const { error } = await supabase.functions.invoke('sync-operational-events', {
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
}
