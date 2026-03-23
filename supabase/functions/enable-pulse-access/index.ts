// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface EnablePulseAccessBody {
  userId: string;
}

interface AdminUserRow {
  id: string;
  role: string;
}

interface TargetUserRow {
  id: string;
  email: string;
  onboarding_completed: boolean | null;
  website: string | null;
}

interface ProjectDomainRow {
  domain: string | null;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function createSupabaseUserClient(authHeader: string) {
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function ensureAuthenticatedAdmin(authorization: string) {
  const userClient = createSupabaseUserClient(authorization);
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user: authUser },
    error: authError
  } = await userClient.auth.getUser();

  if (authError || !authUser?.id) {
    throw new Error('Unauthorized');
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
    throw new Error('Forbidden');
  }

  return {
    adminClient,
    authUserId: authUser.id
  };
}

async function ensureAuthUserExists(adminClient: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    throw error;
  }

  const existingUser = data.users.find((user) => user.email?.trim().toLowerCase() === normalizedEmail);

  if (existingUser) {
    return false;
  }

  const inviteResult = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail);

  if (inviteResult.error) {
    throw inviteResult.error;
  }

  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!isPlainObject(body) || typeof body.userId !== 'string' || !body.userId.trim()) {
    return jsonResponse(400, { error: 'userId is required' });
  }

  try {
    const { adminClient } = await ensureAuthenticatedAdmin(authorization);
    const targetUserId = (body as EnablePulseAccessBody).userId.trim();

    const { data: targetUser, error: targetUserError } = await adminClient
      .from('users')
      .select('id, email, onboarding_completed, website')
      .eq('id', targetUserId)
      .maybeSingle();

    if (targetUserError) {
      throw targetUserError;
    }

    const user = targetUser as TargetUserRow | null;

    if (!user?.id || !isValidEmail(user.email)) {
      return jsonResponse(404, { error: 'Pulse user not found' });
    }

    const { data: latestProject, error: latestProjectError } = await adminClient
      .from('projects')
      .select('domain')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestProjectError) {
      throw latestProjectError;
    }

    const project = latestProject as ProjectDomainRow | null;
    const invited = await ensureAuthUserExists(adminClient, user.email);
    const hasConfiguredUrl = Boolean(user.website?.trim() || project?.domain?.trim());

    if (hasConfiguredUrl && !user.onboarding_completed) {
      const { error: updateError } = await adminClient
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return jsonResponse(200, {
      invited,
      onboarding_completed: hasConfiguredUrl ? true : Boolean(user.onboarding_completed),
      status: 'enabled'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Unauthorized') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'Forbidden') {
      return jsonResponse(403, { error: message });
    }

    console.error('Error en enable-pulse-access:', message);
    return jsonResponse(500, { error: 'Unable to enable Pulse access' });
  }
});
