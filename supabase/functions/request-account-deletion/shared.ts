// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

interface RequestUserRow {
  id: string;
  email: string;
  full_name: string | null;
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
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
}

export async function ensureAuthenticatedClient(authorization: string) {
  const userClient = createSupabaseUserClient(authorization);
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !authUser?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const { data, error } = await adminClient
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const user = data as RequestUserRow | null;

  if (!user?.id || !user.email) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.role === 'admin') {
    throw new Error('ADMIN_NOT_ALLOWED');
  }

  return { adminClient, user };
}

export async function ensureNoOpenDeletionRequest(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const { count, error } = await adminClient
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('category', 'account_deletion')
    .in('status', ['open', 'in_progress']);

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) {
    throw new Error('REQUEST_ALREADY_OPEN');
  }
}

export async function createDeletionTicket(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  user: RequestUserRow,
  reason: string,
) {
  const now = new Date().toISOString();
  const title = 'Solicitud de baja de cuenta';

  const { data, error } = await adminClient
    .from('tickets')
    .insert({
      title,
      asunto: title,
      description: reason,
      mensaje: reason,
      email: user.email,
      user_id: user.id,
      category: 'account_deletion',
      priority: 'high',
      prioridad: 'alta',
      urgency: 'high',
      status: 'open',
      estado: 'abierto',
      created_at: now,
      updated_at: now,
      fecha: now,
      tags: ['account-deletion'],
    })
    .select('id, status, created_at, description, mensaje, respuesta')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function notifyAdminsAboutDeletionRequest(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  user: RequestUserRow,
  requestId: string,
) {
  const { data: admins, error: adminsError } = await adminClient
    .from('users')
    .select('id')
    .eq('role', 'admin');

  if (adminsError) {
    throw adminsError;
  }

  const adminIds = (admins ?? []).map((admin) => admin.id).filter(Boolean);

  if (adminIds.length === 0) {
    return;
  }

  const { error } = await adminClient.from('notifications').insert(
    adminIds.map((adminId) => ({
      user_id: adminId,
      title: 'Solicitud de baja de cuenta',
      message: `${user.full_name || user.email} pidió revisar la baja de su cuenta en Pulse.`,
      type: 'warning',
      category: 'user',
      is_urgent: true,
      action_url: '/admin/usuarios?usersFilter=deletion-requests',
      metadata: {
        request_id: requestId,
        requested_user_id: user.id,
        requested_user_email: user.email,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  );

  if (error) {
    throw error;
  }
}
