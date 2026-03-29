import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import type { AccountDeletionRequestSnapshot } from '@/features/profile/types/accountDeletion';
import { supabase } from '@/lib/supabase/supabase';

function mapDeletionSnapshot(row: Record<string, unknown> | null): AccountDeletionRequestSnapshot {
  if (!row) {
    return {
      id: '',
      state: 'none',
      requestedAt: null,
      reason: null,
      response: null,
    };
  }

  const status = typeof row.status === 'string' ? row.status : '';

  return {
    id: typeof row.id === 'string' ? row.id : '',
    state: status === 'open' || status === 'in_progress' ? 'pending' : 'denied',
    requestedAt: typeof row.created_at === 'string' ? row.created_at : null,
    reason: typeof row.mensaje === 'string' ? row.mensaje : null,
    response: typeof row.respuesta === 'string' ? row.respuesta : null,
  };
}

function getFunctionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FunctionsHttpError) {
    return error.context
      .json()
      .then((payload: unknown) => {
        const response = payload as { error?: string; reason?: string } | null;

        if (response && typeof response.error === 'string') {
          return response.error;
        }

        if (response && typeof response.reason === 'string') {
          return response.reason;
        }

        return fallback;
      })
      .catch(() => fallback);
  }

  if (error instanceof FunctionsRelayError) {
    return Promise.resolve('El relay de Supabase rechazó la solicitud.');
  }

  if (error instanceof FunctionsFetchError) {
    return Promise.resolve('No pudimos conectarnos con el backend de Pulse.');
  }

  return Promise.resolve(fallback);
}

export async function fetchAccountDeletionRequest(userId: string): Promise<AccountDeletionRequestSnapshot> {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, status, created_at, mensaje, respuesta')
    .eq('user_id', userId)
    .eq('category', 'account_deletion')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos revisar tu solicitud de baja: ${error.message}`);
  }

  return mapDeletionSnapshot((data as Record<string, unknown> | null) ?? null);
}

export async function requestAccountDeletion(reason: string): Promise<AccountDeletionRequestSnapshot> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Necesitás una sesión activa para solicitar la baja.');
  }

  const { data, error } = await supabase.functions.invoke('request-account-deletion', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: { reason },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, 'No pudimos enviar tu solicitud de baja.'));
  }

  return mapDeletionSnapshot((data as { request?: Record<string, unknown> | null } | null)?.request ?? null);
}
