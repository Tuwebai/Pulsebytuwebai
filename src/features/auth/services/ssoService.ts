import { supabase } from '@/lib/supabase';

interface SsoBridgeResponse {
  email: string;
  email_otp: string;
  verification_type: 'magiclink' | 'email';
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
    throw new Error('No pudimos validar tu acceso unificado.');
  }

  if (!isSsoBridgeResponse(data)) {
    throw new Error('La respuesta del acceso unificado vino incompleta.');
  }

  return data;
}

export async function signInWithSsoToken(token: string): Promise<void> {
  const bridge = await getSsoBridge(token);

  const { error } = await supabase.auth.verifyOtp({
    email: bridge.email,
    token: bridge.email_otp,
    type: bridge.verification_type
  });

  if (error) {
    throw new Error('No pudimos abrir tu sesion en Pulse.');
  }
}
