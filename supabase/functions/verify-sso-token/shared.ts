// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
} as const;

export type PulseAccessStatus = 'pending' | 'invited' | 'active' | 'disabled';

export interface SsoRequestBody {
  token: string;
}

export interface SsoClaims {
  sub: string;
  iss: string;
  exp: number;
}

export interface PulseUserRow {
  id: string;
  email: string;
  role: string | null;
  onboarding_completed: boolean | null;
  pulse_access_status: PulseAccessStatus;
}

export interface AuthUserRecord {
  email?: string | null;
}

export interface SsoBridgeResponse {
  email: string;
  email_otp: string;
  verification_type: 'magiclink' | 'email';
  redirect_path: '/admin' | '/dashboard' | '/onboarding';
}

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAuthUserByEmail(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string
): Promise<AuthUserRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw error;
    }

    const authUser = data.users.find((user) => normalizeEmail(user.email ?? '') === normalizedEmail);

    if (authUser) {
      return authUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

export function decodeBase64Url(input: string): Uint8Array {
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

export async function verifyTokenSignature(token: string, secret: string): Promise<SsoClaims> {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('TOKEN_FORMAT_INVALID');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader))) as { alg?: string };
  const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as Partial<SsoClaims>;

  if (header.alg !== 'HS256') {
    throw new Error('TOKEN_ALGORITHM_INVALID');
  }

  const key = await importHmacKey(secret);
  const isValidSignature = await crypto.subtle.verify(
    'HMAC',
    key,
    decodeBase64Url(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  if (!isValidSignature) {
    throw new Error('TOKEN_SIGNATURE_INVALID');
  }

  if (typeof payload.sub !== 'string' || !isValidEmail(payload.sub)) {
    throw new Error('TOKEN_SUB_INVALID');
  }

  if (payload.iss !== 'tuweb-ai.com') {
    throw new Error('TOKEN_ISSUER_INVALID');
  }

  if (typeof payload.exp !== 'number') {
    throw new Error('TOKEN_EXP_INVALID');
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) {
    throw new Error('TOKEN_EXPIRED');
  }

  if (payload.exp - now > 300) {
    throw new Error('TOKEN_TTL_INVALID');
  }

  return {
    sub: payload.sub,
    iss: payload.iss,
    exp: payload.exp
  };
}

export function getRedirectPath(user: PulseUserRow): '/admin' | '/dashboard' | '/onboarding' {
  if (user.role === 'admin') {
    return '/admin';
  }

  return user.onboarding_completed ? '/dashboard' : '/onboarding';
}
