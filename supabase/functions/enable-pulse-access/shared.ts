// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
} as const;

export type PulseAccessStatus = 'pending' | 'invited' | 'active' | 'disabled';
export type PulseAccessAction = 'enable' | 'resend';

export interface EnablePulseAccessBody {
  userId?: string;
  email?: string;
  action?: PulseAccessAction;
}

export interface AdminUserRow {
  id: string;
  role: string | null;
}

export interface TargetUserRow {
  id: string;
  email: string;
  full_name: string | null;
  pulse_access_status: PulseAccessStatus;
  pulse_access_granted_at: string | null;
  pulse_access_granted_by: string | null;
}

export interface EnablePulseAccessResponse {
  invited: boolean;
  email_sent: boolean;
  delivery_type: 'invite' | 'magiclink' | 'none';
  user_id: string;
  email: string;
  pulse_access_status: Extract<PulseAccessStatus, 'invited' | 'active'>;
  pulse_access_granted_at: string | null;
  pulse_access_granted_by: string | null;
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

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getPulseAccessRedirectUrl() {
  return Deno.env.get('PULSE_ACCESS_REDIRECT_URL') || 'https://pulse.tuweb-ai.com/';
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

export function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });
}

export function createSupabasePublicClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function ensureAuthenticatedAdmin(authorization: string) {
  const userClient = createSupabaseUserClient(authorization);
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user: authUser },
    error: authError
  } = await userClient.auth.getUser();

  if (authError || !authUser?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: isAdmin, error: isAdminError } = await userClient.rpc('is_admin');

  if (!isAdminError && isAdmin === true) {
    return {
      adminClient,
      authUserId: authUser.id
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
    authUserId: authUser.id
  };
}

export async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  email: string
) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({
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

export async function deliverPulseAccess(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  user: Pick<TargetUserRow, 'email' | 'full_name'>
) {
  const normalizedEmail = normalizeEmail(user.email);
  const redirectTo = getPulseAccessRedirectUrl();
  const existingUser = await findAuthUserByEmail(adminClient, normalizedEmail);

  if (existingUser?.email) {
    const publicClient = createSupabasePublicClient();
    const signInResult = await publicClient.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo
      }
    });

    if (signInResult.error) {
      throw signInResult.error;
    }

    return {
      invited: false,
      email_sent: true,
      delivery_type: 'magiclink' as const
    };
  }

  const inviteResult = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo
  });

  if (inviteResult.error) {
    throw inviteResult.error;
  }

  return {
    invited: true,
    email_sent: true,
    delivery_type: 'invite' as const
  };
}
