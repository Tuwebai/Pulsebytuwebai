import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import type { PulseRealtimeSnapshot } from '@/data/types/pulse';

export async function fetchPulseRealtimeSnapshot(projectId: string): Promise<PulseRealtimeSnapshot> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión no está disponible para consultar la actividad en vivo.');
  }

  const { data, error } = await supabase.functions.invoke('pulse-ga4-realtime', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      projectId,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message || 'No pudimos consultar la actividad en vivo de tu web.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la consulta en vivo de Pulse.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función de actividad en vivo.');
    }

    throw new Error('No pudimos consultar la actividad en vivo de tu web.');
  }

  return data as PulseRealtimeSnapshot;
}
