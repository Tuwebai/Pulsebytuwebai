import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  createSupabaseAdminClient,
  findAuthUserByEmail,
  getRedirectPath,
  isPlainObject,
  jsonResponse,
  normalizeEmail,
  type PulseUserRow,
  type SsoBridgeResponse,
  type SsoRequestBody,
  verifyTokenSignature
} from './shared.ts';

function mapAccessErrorToResponse(status: PulseUserRow['pulse_access_status']) {
  if (status === 'pending') {
    return jsonResponse(403, { error: 'ACCESS_PENDING' });
  }

  return jsonResponse(403, { error: 'ACCESS_DISABLED' });
}

function isJwtValidationError(message: string) {
  return message.startsWith('TOKEN_');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const sharedSecret = Deno.env.get('TUWEBAI_WEBHOOK_SECRET');
  if (!sharedSecret) {
    console.error('TUWEBAI_WEBHOOK_SECRET no configurado');
    return jsonResponse(500, { error: 'SSO_SECRET_MISCONFIGURED' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!isPlainObject(body)) {
    return jsonResponse(400, { error: 'Invalid payload structure' });
  }

  const { token } = body as Partial<SsoRequestBody>;

  if (typeof token !== 'string' || !token.trim()) {
    return jsonResponse(400, { error: 'token is required' });
  }

  try {
    const claims = await verifyTokenSignature(token.trim(), sharedSecret);
    const email = normalizeEmail(claims.sub);
    const supabase = createSupabaseAdminClient();

    const { data: pulseUser, error: pulseUserError } = await supabase
      .from('users')
      .select('id, email, role, onboarding_completed, pulse_access_status')
      .eq('email', email)
      .maybeSingle();

    if (pulseUserError) {
      throw pulseUserError;
    }

    const user = pulseUser as PulseUserRow | null;

    if (!user?.id) {
      return jsonResponse(404, { error: 'USER_NOT_FOUND' });
    }

    const authUser = await findAuthUserByEmail(supabase, email);

    if (!authUser?.email) {
      return jsonResponse(404, { error: 'AUTH_NOT_FOUND' });
    }

    if (user.pulse_access_status !== 'invited' && user.pulse_access_status !== 'active') {
      return mapAccessErrorToResponse(user.pulse_access_status);
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email
    });

    if (linkError) {
      return jsonResponse(401, { error: 'Unable to create Supabase session bridge' });
    }

    const emailOtp = linkData.properties?.email_otp;
    const verificationType = linkData.properties?.verification_type;

    if (!emailOtp || !verificationType) {
      throw new Error('Magic link properties missing');
    }

    const response: SsoBridgeResponse = {
      email,
      email_otp: emailOtp,
      verification_type: verificationType,
      redirect_path: getRedirectPath(user)
    };

    return jsonResponse(200, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error en verify-sso-token:', message);

    if (isJwtValidationError(message)) {
      return jsonResponse(401, { error: 'INVALID_SSO_TOKEN' });
    }

    return jsonResponse(401, { error: 'INVALID_SSO_TOKEN' });
  }
});
