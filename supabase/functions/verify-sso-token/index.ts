// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface SsoRequestBody {
  token: string;
}

interface SsoClaims {
  sub: string;
  iss: string;
  exp: number;
}

interface PulseUserRow {
  id: string;
  email: string;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function decodeBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  );
}

async function verifyTokenSignature(token: string, secret: string): Promise<SsoClaims> {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Token format invalid');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader))) as { alg?: string; typ?: string };
  const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as Partial<SsoClaims>;

  if (header.alg !== 'HS256') {
    throw new Error('Unsupported token algorithm');
  }

  const key = await importHmacKey(secret);
  const isValidSignature = await crypto.subtle.verify(
    'HMAC',
    key,
    decodeBase64Url(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  if (!isValidSignature) {
    throw new Error('Invalid token signature');
  }

  if (typeof payload.sub !== 'string' || !isValidEmail(payload.sub)) {
    throw new Error('Token sub invalid');
  }

  if (payload.iss !== 'tuweb-ai.com') {
    throw new Error('Token issuer invalid');
  }

  if (typeof payload.exp !== 'number') {
    throw new Error('Token exp invalid');
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) {
    throw new Error('Token expired');
  }

  if (payload.exp - now > 300) {
    throw new Error('Token ttl exceeds maximum allowed');
  }

  return {
    sub: payload.sub,
    iss: payload.iss,
    exp: payload.exp
  };
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
    return jsonResponse(500, { error: 'SSO secret misconfigured' });
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
    const email = claims.sub.trim().toLowerCase();
    const supabase = createSupabaseAdminClient();

    const { data: pulseUser, error: pulseUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (pulseUserError) {
      throw pulseUserError;
    }

    const user = pulseUser as PulseUserRow | null;

    if (!user?.id) {
      return jsonResponse(404, { error: 'Pulse user not found' });
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

    return jsonResponse(200, {
      email,
      email_otp: emailOtp,
      verification_type: verificationType
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error en verify-sso-token:', message);
    return jsonResponse(401, { error: 'Invalid SSO token' });
  }
});
