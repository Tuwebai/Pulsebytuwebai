// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

export interface DeleteAdminUserBody {
  userId?: string;
}

interface AdminUserRow {
  id: string;
  role: string | null;
}

export interface TargetUserRow {
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

export interface DeleteAdminUserResponse {
  deleted_user_id: string;
  deleted_email: string;
  deleted_profile: boolean;
  deleted_auth_user: boolean;
}

function isMissingAuthUserError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const payload = error as {
    status?: number;
    message?: string;
    code?: string;
  };

  const message = payload.message?.toLowerCase() ?? '';

  return (
    payload.status === 404 ||
    payload.code === 'user_not_found' ||
    message.includes('user not found') ||
    message.includes('not found')
  );
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

  return data as TargetUserRow | null;
}

export async function getRemainingAdminCount(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const { count, error } = await adminClient
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
    .neq('id', userId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function countRows(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  column: string,
  userId: string,
) {
  const { count, error } = await adminClient
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, userId);

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
    { code: 'TICKETS', label: 'tickets', table: 'tickets', column: 'user_id' },
    { code: 'OPERATIONAL_EVENTS_OWNER', label: 'eventos operativos asignados', table: 'operational_events', column: 'owner_id' },
    { code: 'APPROVAL_REQUESTS_REQUESTED', label: 'solicitudes de aprobacion', table: 'project_approval_requests', column: 'requested_by' },
    { code: 'APPROVAL_REQUESTS_REVIEWED', label: 'revisiones de aprobacion', table: 'project_approval_requests', column: 'reviewed_by' },
    { code: 'PROJECTS_APPROVED', label: 'proyectos aprobados', table: 'projects', column: 'approved_by' },
    { code: 'SATISFACTION_SURVEYS', label: 'encuestas', table: 'satisfaction_surveys', column: 'user_id' },
    { code: 'USER_INVITATIONS', label: 'invitaciones emitidas', table: 'user_invitations', column: 'invited_by' },
  ] as const;

  const counts = await Promise.all(
    checks.map(async (check) => ({
      code: check.code,
      label: check.label,
      count: await countRows(adminClient, check.table, check.column, userId),
    })),
  );

  return counts.filter((check) => check.count > 0) as UserDeletionBlocker[];
}

export async function deleteAuthUserIfPresent(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const { data: authUserData, error: authLookupError } = await adminClient.auth.admin.getUserById(
    userId,
  );

  if (authLookupError) {
    if (isMissingAuthUserError(authLookupError)) {
      return false;
    }

    throw authLookupError;
  }

  if (!authUserData.user) {
    return false;
  }

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    if (isMissingAuthUserError(authDeleteError)) {
      return false;
    }

    throw authDeleteError;
  }

  return true;
}
