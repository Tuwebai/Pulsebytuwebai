import { FunctionsHttpError } from '@supabase/supabase-js';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { userService } from '@/lib/supabase/supabaseService';
import { supabase } from '@/lib/supabase';

interface SsoBridgeResponse {
  email: string;
  email_otp: string;
  verification_type: 'magiclink' | 'email';
}

interface SsoErrorPayload {
  error?: string;
}

export type SsoAccessErrorCode = 'access_pending' | 'invalid_token' | 'session_bridge_failed';

export class SsoAccessError extends Error {
  code: SsoAccessErrorCode;

  constructor(code: SsoAccessErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function isSsoBridgeResponse(value: unknown): value is SsoBridgeResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.email === 'string' &&
    typeof response.email_otp === 'string' &&
    (response.verification_type === 'magiclink' || response.verification_type === 'email')
  );
}

async function getSsoBridge(token: string): Promise<SsoBridgeResponse> {
  const { data, error } = await supabase.functions.invoke('verify-sso-token', {
    body: { token }
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json()) as SsoErrorPayload;

      if (
        error.context.status === 404 &&
        (payload.error === 'Pulse user not found' || payload.error === 'Pulse auth user not found')
      ) {
        throw new SsoAccessError(
          'access_pending',
          'Tu acceso a Pulse todavia no fue habilitado por un administrador.'
        );
      }
    }

    throw new SsoAccessError('invalid_token', 'No pudimos validar tu acceso unificado.');
  }

  if (!isSsoBridgeResponse(data)) {
    throw new SsoAccessError('session_bridge_failed', 'La respuesta del acceso unificado vino incompleta.');
  }

  return data;
}

async function resolvePostSsoPath(): Promise<string> {
  const {
    data: { user: authUser }
  } = await supabase.auth.getUser();

  if (!authUser?.id) {
    throw new SsoAccessError('session_bridge_failed', 'No pudimos recuperar tu sesion en Pulse.');
  }

  const pulseUser = await userService.getUserById(authUser.id);
  return getPostLoginPath(pulseUser ?? undefined);
}

export async function signInWithSsoToken(token: string): Promise<string> {
  const bridge = await getSsoBridge(token);

  const { error } = await supabase.auth.verifyOtp({
    email: bridge.email,
    token: bridge.email_otp,
    type: bridge.verification_type
  });

  if (error) {
    throw new SsoAccessError('session_bridge_failed', 'No pudimos abrir tu sesion en Pulse.');
  }

  return resolvePostSsoPath();
}
