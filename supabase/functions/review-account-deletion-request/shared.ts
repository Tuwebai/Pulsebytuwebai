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
  email: string | null;
  full_name: string | null;
}

interface DeletionTicketRow {
  id: string;
  user_id: string | null;
  asunto: string | null;
  status: string | null;
  estado: string | null;
  email: string | null;
}

interface DeletionTargetUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

export interface UserDeletionBlocker {
  code: string;
  label: string;
  count: number;
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

function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
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
    const { data: profile } = await adminClient
      .from('users')
      .select('id, role, email, full_name')
      .eq('id', authUser.id)
      .maybeSingle();

    return { adminClient, reviewer: profile as AdminUserRow | null };
  }

  const { data: reviewer, error } = await adminClient
    .from('users')
    .select('id, role, email, full_name')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if ((reviewer as AdminUserRow | null)?.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return { adminClient, reviewer: reviewer as AdminUserRow | null };
}

export async function getDeletionTicket(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  requestId: string,
) {
  const { data, error } = await adminClient
    .from('tickets')
    .select('id, user_id, asunto, status, estado, email')
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DeletionTicketRow | null;
}

export async function getTargetUser(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const { data, error } = await adminClient
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DeletionTargetUserRow | null;
}

async function countRows(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  column: string,
  userId: string,
  subjectToExclude?: string,
) {
  let query = adminClient.from(table).select('id', { count: 'exact', head: true }).eq(column, userId);

  if (subjectToExclude) {
    query = query.neq('asunto', subjectToExclude);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getDeletionBlockers(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const checks = [
    { code: 'PROJECTS_CREATED', label: 'proyectos creados', table: 'projects', column: 'created_by' },
    { code: 'SUPPORT_TICKETS', label: 'tickets activos', table: 'tickets', column: 'user_id', subjectToExclude: 'Solicitud de baja de cuenta' },
    { code: 'OPERATIONAL_EVENTS_OWNER', label: 'eventos operativos asignados', table: 'operational_events', column: 'owner_id' },
    { code: 'PROJECTS_APPROVED', label: 'proyectos aprobados', table: 'projects', column: 'approved_by' },
  ] as const;

  const counts = await Promise.all(
    checks.map(async (check) => ({
      code: check.code,
      label: check.label,
      count: await countRows(adminClient, check.table, check.column, userId, check.subjectToExclude),
    })),
  );

  return counts.filter((check) => check.count > 0) as UserDeletionBlocker[];
}

function isMissingAuthUserError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const payload = error as { status?: number; message?: string; code?: string };
  const message = payload.message?.toLowerCase() ?? '';

  return payload.status === 404 || payload.code === 'user_not_found' || message.includes('not found');
}

export async function deleteAuthUserIfPresent(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const { data: authUserData, error: authLookupError } = await adminClient.auth.admin.getUserById(userId);

  if (authLookupError) {
    if (isMissingAuthUserError(authLookupError)) {
      return false;
    }

    throw authLookupError;
  }

  if (!authUserData.user) {
    return false;
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    if (isMissingAuthUserError(error)) {
      return false;
    }

    throw error;
  }

  return true;
}
