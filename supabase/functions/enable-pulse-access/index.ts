import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  ensureAuthenticatedAdmin,
  ensureAuthUserExists,
  type EnablePulseAccessBody,
  type EnablePulseAccessResponse,
  type TargetUserRow,
  isPlainObject,
  isValidEmail,
  jsonResponse,
  normalizeEmail
} from './shared.ts';

function isInvokablePayload(body: unknown): body is EnablePulseAccessBody {
  if (!isPlainObject(body)) {
    return false;
  }

  const userIdValid = typeof body.userId === 'string' && body.userId.trim().length > 0;
  const emailValid = typeof body.email === 'string' && isValidEmail(body.email.trim());

  return userIdValid || emailValid;
}

async function findTargetUser(
  adminClient: Awaited<ReturnType<typeof ensureAuthenticatedAdmin>>['adminClient'],
  body: EnablePulseAccessBody
) {
  if (typeof body.userId === 'string' && body.userId.trim()) {
    const { data, error } = await adminClient
      .from('users')
      .select('id, email, pulse_access_status, pulse_access_granted_at, pulse_access_granted_by')
      .eq('id', body.userId.trim())
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as TargetUserRow | null;
  }

  const normalizedEmail = normalizeEmail(body.email ?? '');
  const { data, error } = await adminClient
    .from('users')
    .select('id, email, pulse_access_status, pulse_access_granted_at, pulse_access_granted_by')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as TargetUserRow | null;
}

async function createInvitedUser(
  adminClient: Awaited<ReturnType<typeof ensureAuthenticatedAdmin>>['adminClient'],
  email: string,
  adminUserId: string
) {
  const timestamp = new Date().toISOString();
  const { data, error } = await adminClient
    .from('users')
    .insert({
      email: normalizeEmail(email),
      role: 'user',
      pulse_access_status: 'invited',
      pulse_access_granted_at: timestamp,
      pulse_access_granted_by: adminUserId,
      updated_at: timestamp
    })
    .select('id, email, pulse_access_status, pulse_access_granted_at, pulse_access_granted_by')
    .single();

  if (error) {
    throw error;
  }

  return data as TargetUserRow;
}

async function promotePendingUser(
  adminClient: Awaited<ReturnType<typeof ensureAuthenticatedAdmin>>['adminClient'],
  userId: string,
  adminUserId: string
) {
  const timestamp = new Date().toISOString();
  const { data, error } = await adminClient
    .from('users')
    .update({
      pulse_access_status: 'invited',
      pulse_access_granted_at: timestamp,
      pulse_access_granted_by: adminUserId,
      pulse_access_disabled_at: null,
      updated_at: timestamp
    })
    .eq('id', userId)
    .select('id, email, pulse_access_status, pulse_access_granted_at, pulse_access_granted_by')
    .single();

  if (error) {
    throw error;
  }

  return data as TargetUserRow;
}

function toResponse(user: TargetUserRow, invited: boolean): EnablePulseAccessResponse {
  return {
    invited,
    user_id: user.id,
    email: normalizeEmail(user.email),
    pulse_access_status: user.pulse_access_status === 'active' ? 'active' : 'invited',
    pulse_access_granted_at: user.pulse_access_granted_at,
    pulse_access_granted_by: user.pulse_access_granted_by
  };
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

  if (!isInvokablePayload(body)) {
    return jsonResponse(400, { error: 'userId or email is required' });
  }

  try {
    const { adminClient, authUserId } = await ensureAuthenticatedAdmin(authorization);
    const payload = body as EnablePulseAccessBody;
    const requestedEmail =
      typeof payload.email === 'string' && isValidEmail(payload.email) ? normalizeEmail(payload.email) : null;

    let user = await findTargetUser(adminClient, payload);

    if (!user) {
      if (!requestedEmail) {
        return jsonResponse(404, { error: 'USER_NOT_FOUND' });
      }

      user = await createInvitedUser(adminClient, requestedEmail, authUserId);
    } else if (user.pulse_access_status === 'disabled') {
      return jsonResponse(409, { error: 'ACCESS_DISABLED' });
    } else if (user.pulse_access_status === 'pending') {
      user = await promotePendingUser(adminClient, user.id, authUserId);
    }

    const invited = await ensureAuthUserExists(adminClient, user.email);
    return jsonResponse(200, toResponse(user, invited));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: message });
    }

    console.error('Error en enable-pulse-access:', message);
    return jsonResponse(500, { error: 'Unable to enable Pulse access' });
  }
});
