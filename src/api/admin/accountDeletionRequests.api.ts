import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { supabase } from '@/data/supabase/client';

export type AccountDeletionDecision = 'approve' | 'deny';

export interface ReviewAccountDeletionPayload {
  requestId: string;
  decision: AccountDeletionDecision;
  note?: string;
}

export interface AccountDeletionBlocker {
  code: string;
  label: string;
  count: number;
}

async function getAdminAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para revisar bajas.');
  }

  return session.access_token;
}

export async function reviewAccountDeletionRequest(payload: ReviewAccountDeletionPayload) {
  const accessToken = await getAdminAccessToken();
  const { data, error } = await supabase.functions.invoke('review-account-deletion-request', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: payload,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = (await error.context.json().catch(() => null)) as {
        error?: string;
        blockers?: AccountDeletionBlocker[];
      } | null;

      if (error.context.status === 409 && body?.error === 'USER_DELETE_BLOCKED') {
        const blockers = body.blockers ?? [];
        const details = blockers.map((blocker) => `${blocker.count} ${blocker.label}`).join(', ');
        throw new Error(
          details
            ? `No se puede aprobar la baja porque el usuario todavía tiene referencias activas: ${details}.`
            : 'No se puede aprobar la baja porque el usuario todavía tiene referencias activas.',
        );
      }

      throw new Error(body?.error || 'No pudimos revisar la solicitud de baja.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la revisión de la solicitud.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con el backend que revisa bajas.');
    }

    throw new Error('No pudimos revisar la solicitud de baja.');
  }

  return data as { decision: AccountDeletionDecision };
}
