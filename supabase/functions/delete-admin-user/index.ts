import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  deleteAuthUserIfPresent,
  ensureAuthenticatedAdmin,
  getDeletionBlockers,
  getRemainingAdminCount,
  getTargetUser,
  isPlainObject,
  jsonResponse,
} from './shared.ts';

function isValidPayload(body: unknown): body is { userId: string } {
  return (
    isPlainObject(body) &&
    typeof body.userId === 'string' &&
    body.userId.trim().length > 0
  );
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
    return jsonResponse(401, { error: 'UNAUTHORIZED' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'INVALID_JSON' });
  }

  if (!isValidPayload(body)) {
    return jsonResponse(400, { error: 'USER_ID_REQUIRED' });
  }

  try {
    const { adminClient, authUserId } = await ensureAuthenticatedAdmin(authorization);
    const targetUserId = body.userId.trim();

    if (targetUserId === authUserId) {
      return jsonResponse(409, { error: 'CANNOT_DELETE_SELF' });
    }

    const targetUser = await getTargetUser(adminClient, targetUserId);

    if (!targetUser) {
      return jsonResponse(404, { error: 'USER_NOT_FOUND' });
    }

    if (targetUser.role === 'admin') {
      const remainingAdmins = await getRemainingAdminCount(adminClient, targetUserId);

      if (remainingAdmins === 0) {
        return jsonResponse(409, { error: 'LAST_ADMIN' });
      }
    }

    const blockers = await getDeletionBlockers(adminClient, targetUserId);

    if (blockers.length > 0) {
      return jsonResponse(409, {
        error: 'USER_DELETE_BLOCKED',
        blockers,
      });
    }

    const { error: profileDeleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', targetUserId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    const deletedAuthUser = await deleteAuthUserIfPresent(adminClient, targetUserId);

    return jsonResponse(200, {
      deleted_user_id: targetUser.id,
      deleted_email: targetUser.email,
      deleted_profile: true,
      deleted_auth_user: deletedAuthUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: message });
    }

    console.error('Error en delete-admin-user:', message);
    return jsonResponse(500, {
      error: 'USER_DELETE_FAILED',
      reason: message,
    });
  }
});
