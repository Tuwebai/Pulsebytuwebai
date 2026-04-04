// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

interface AdminUserRow {
  id: string;
  role: string | null;
}

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

export async function ensureAuthenticatedAdmin(authorization: string) {
  const userClient = createSupabaseUserClient(authorization);
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !authUser?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: isAdmin, error: isAdminError } = await userClient.rpc('is_admin');

  if (!isAdminError && isAdmin === true) {
    return {
      adminClient,
      authUserId: authUser.id,
    };
  }

  const { data: adminUser, error: adminUserError } = await adminClient
    .from('users')
    .select('id, role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (adminUserError) {
    throw adminUserError;
  }

  if ((adminUser as AdminUserRow | null)?.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return {
    adminClient,
    authUserId: authUser.id,
  };
}

export function normalizeDomainInput(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .replace(/\/+$/, '')
      .toLowerCase();
  }
}

export function validateBusinessDomain(input: string) {
  const normalizedDomain = normalizeDomainInput(input);

  if (!normalizedDomain) {
    return {
      isValid: false,
      normalizedDomain: '',
      errorMessage: 'Ingresa una URL valida para continuar.',
    };
  }

  if (normalizedDomain === 'localhost' || normalizedDomain.endsWith('.local')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'Usa el dominio publico de tu sitio, no una direccion local.',
    };
  }

  if (!normalizedDomain.includes('.')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'La URL debe tener un dominio valido, por ejemplo tuempresa.com.',
    };
  }

  if (!/^[a-z0-9.-]+$/i.test(normalizedDomain) || normalizedDomain.startsWith('.') || normalizedDomain.endsWith('.')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'La URL tiene caracteres no validos.',
    };
  }

  return {
    isValid: true,
    normalizedDomain,
    errorMessage: null,
  };
}
