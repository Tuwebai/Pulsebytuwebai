import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  ensureAuthenticatedAdmin,
  findAuthUserByEmail,
  isPlainObject,
  isValidEmail,
  jsonResponse,
  normalizeEmail,
  normalizeUserRole,
} from './shared.ts';

async function waitForProfileRow(
  adminClient: Awaited<ReturnType<typeof ensureAuthenticatedAdmin>>['adminClient'],
  userId: string,
) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.id) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error('PROFILE_ROW_NOT_READY');
}

function isValidPayload(
  body: unknown,
): body is { email: string; full_name: string; role?: string } {
  return (
    isPlainObject(body) &&
    typeof body.email === 'string' &&
    isValidEmail(body.email.trim()) &&
    typeof body.full_name === 'string' &&
    body.full_name.trim().length >= 2
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED' });
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return jsonResponse(401, { error: 'UNAUTHORIZED' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'INVALID_JSON' });
  }

  if (!isValidPayload(body)) {
    return jsonResponse(400, { error: 'INVALID_PAYLOAD' });
  }

  try {
    const { adminClient } = await ensureAuthenticatedAdmin(authorization);
    const email = normalizeEmail(body.email);
    const fullName = body.full_name.trim();
    const role = normalizeUserRole(body.role);

    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError) {
      throw existingProfileError;
    }

    if (existingProfile) {
      return jsonResponse(409, { error: 'USER_ALREADY_EXISTS' });
    }

    const existingAuthUser = await findAuthUserByEmail(adminClient, email);

    if (existingAuthUser) {
      return jsonResponse(409, { error: 'AUTH_USER_ALREADY_EXISTS' });
    }

    const { data: createdAuth, error: authCreateError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authCreateError || !createdAuth.user?.id) {
      throw authCreateError ?? new Error('AUTH_CREATE_FAILED');
    }

    const userId = createdAuth.user.id;
    await waitForProfileRow(adminClient, userId);
    const timestamp = new Date().toISOString();

    const { data: updatedProfile, error: profileUpdateError } = await adminClient
      .from('users')
      .update({
        email,
        full_name: fullName,
        role,
        pulse_access_status: 'pending',
        pulse_access_granted_at: null,
        pulse_access_granted_by: null,
        pulse_access_disabled_at: null,
        updated_at: timestamp,
      })
      .eq('id', userId)
      .select('id, email, full_name, role, pulse_access_status')
      .single();

    if (profileUpdateError) {
      throw profileUpdateError;
    }

    return jsonResponse(200, {
      id: updatedProfile.id,
      email: updatedProfile.email,
      full_name: updatedProfile.full_name,
      role: updatedProfile.role,
      pulse_access_status: updatedProfile.pulse_access_status,
      created_auth_user: true,
      created_profile: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: message });
    }

    console.error('Error en create-admin-user:', message);
    return jsonResponse(500, {
      error: 'CREATE_ADMIN_USER_FAILED',
      reason: message,
    });
  }
});
