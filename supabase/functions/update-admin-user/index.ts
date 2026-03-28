import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  ensureAuthenticatedAdmin,
  isPlainObject,
  isValidEmail,
  jsonResponse,
  normalizeEmail,
  normalizeUserRole,
} from './shared.ts';

function isValidPayload(
  body: unknown,
): body is { userId: string; email: string; full_name: string; role?: string } {
  return (
    isPlainObject(body) &&
    typeof body.userId === 'string' &&
    body.userId.trim().length > 0 &&
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
    const { adminClient, authUserId } = await ensureAuthenticatedAdmin(authorization);
    const userId = body.userId.trim();
    const email = normalizeEmail(body.email);
    const fullName = body.full_name.trim();
    const role = normalizeUserRole(body.role);

    const { data: targetUser, error: targetUserError } = await adminClient
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (targetUserError) {
      throw targetUserError;
    }

    if (!targetUser?.id) {
      return jsonResponse(404, { error: 'USER_NOT_FOUND' });
    }

    const { data: duplicatedUser, error: duplicatedUserError } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .maybeSingle();

    if (duplicatedUserError) {
      throw duplicatedUserError;
    }

    if (duplicatedUser?.id) {
      return jsonResponse(409, { error: 'EMAIL_ALREADY_IN_USE' });
    }

    const timestamp = new Date().toISOString();
    const { data: updatedUser, error: updateError } = await adminClient
      .from('users')
      .update({
        email,
        full_name: fullName,
        role,
        updated_at: timestamp,
      })
      .eq('id', userId)
      .select('id, email, full_name, role, pulse_access_status, updated_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    if (authUserId !== userId) {
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(userId, {
        email,
        user_metadata: {
          full_name: fullName,
        },
      });

      if (authUpdateError) {
        throw authUpdateError;
      }
    }

    return jsonResponse(200, {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      pulse_access_status: updatedUser.pulse_access_status,
      updated_at: updatedUser.updated_at,
      updated_auth_user: authUserId !== userId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: message });
    }

    console.error('Error en update-admin-user:', message);
    return jsonResponse(500, {
      error: 'UPDATE_ADMIN_USER_FAILED',
      reason: message,
    });
  }
});
