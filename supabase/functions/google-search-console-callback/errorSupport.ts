import {
  GoogleCallbackReason,
  buildCallbackUrl,
  createSupabaseAdminClient,
  readSignedState,
} from '../google-search-console-connect/shared.ts';

interface SignedStatePayload {
  exp: number;
  projectId: string;
  returnAppUrl?: string;
  userId: string;
}

export function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'UNKNOWN_ERROR';
}

function parseGooglePayload(payload: string) {
  try {
    return JSON.parse(payload) as {
      error?: string | { code?: number; message?: string; status?: string };
      error_description?: string;
    };
  } catch {
    return null;
  }
}

export function resolveReasonFromGoogleError(code: string, payload: string): GoogleCallbackReason {
  const parsedPayload = parseGooglePayload(payload);
  const payloadText = payload.toLowerCase();
  const nestedMessage =
    typeof parsedPayload?.error === 'object' && parsedPayload?.error?.message
      ? parsedPayload.error.message.toLowerCase()
      : '';
  const describedError = (parsedPayload?.error_description || '').toLowerCase();
  const flatError = typeof parsedPayload?.error === 'string' ? parsedPayload.error.toLowerCase() : '';
  const combinedText = [payloadText, nestedMessage, describedError, flatError].filter(Boolean).join(' | ');

  if (code === 'PROJECT_NOT_FOUND') {
    return 'project-not-found';
  }

  if (code === 'REFRESH_TOKEN_MISSING') {
    return 'missing-refresh-token';
  }

  if (code === 'INVALID_STATE' || code === 'STATE_EXPIRED' || code === 'INVALID_CALLBACK') {
    return 'invalid-session';
  }

  if (combinedText.includes('access_denied')) {
    return 'access-denied';
  }

  if (combinedText.includes('search console api') && (combinedText.includes('disabled') || combinedText.includes('not been used'))) {
    return 'api-disabled';
  }

  if (combinedText.includes('invalid_client')) {
    return 'invalid-client';
  }

  if (code === 'TOKEN_EXCHANGE_FAILED') {
    return 'token-exchange-failed';
  }

  return 'unknown';
}

export async function persistConnectionError(projectId: string, code: string) {
  const supabase = createSupabaseAdminClient();

  await supabase.from('search_console_properties').upsert(
    {
      project_id: projectId,
      site_url: null,
      property_type: null,
      permission_level: null,
      google_account_email: null,
      connection_status: 'error',
      connected_at: null,
      last_validated_at: new Date().toISOString(),
      last_sync_status: 'idle',
      last_sync_error: code,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id' },
  );
}

export async function resolveErrorRedirectUrl(
  rawState: string | null,
  fallbackAppUrl: string,
  reason: GoogleCallbackReason = 'unknown',
) {
  if (!rawState) {
    return buildCallbackUrl(fallbackAppUrl, 'error', reason);
  }

  try {
    const signedState = await readSignedState<SignedStatePayload>(rawState);
    return buildCallbackUrl(signedState.returnAppUrl || fallbackAppUrl, 'error', reason);
  } catch {
    return buildCallbackUrl(fallbackAppUrl, 'error', reason);
  }
}
