import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

import {
  corsHeaders,
  deleteAuthUserIfPresent,
  ensureAuthenticatedAdmin,
  getDeletionBlockers,
  getDeletionTicket,
  getTargetUser,
  isPlainObject,
  jsonResponse,
} from './shared.ts';

type ReviewDecision = 'approve' | 'deny';

function isValidBody(body: unknown): body is { requestId: string; decision: ReviewDecision; note?: string } {
  return (
    isPlainObject(body) &&
    typeof body.requestId === 'string' &&
    (body.decision === 'approve' || body.decision === 'deny') &&
    (body.note === undefined || typeof body.note === 'string')
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

  if (!isValidBody(body)) {
    return jsonResponse(400, { error: 'INVALID_REVIEW_PAYLOAD' });
  }

  try {
    const { adminClient, reviewer } = await ensureAuthenticatedAdmin(authorization);
    const ticket = await getDeletionTicket(adminClient, body.requestId.trim());

    if (!ticket || ticket.category !== 'account_deletion' || !ticket.user_id) {
      return jsonResponse(404, { error: 'REQUEST_NOT_FOUND' });
    }

    if (ticket.status !== 'open' && ticket.status !== 'in_progress') {
      return jsonResponse(409, { error: 'REQUEST_ALREADY_REVIEWED' });
    }

    const targetUser = await getTargetUser(adminClient, ticket.user_id);

    if (!targetUser) {
      return jsonResponse(404, { error: 'USER_NOT_FOUND' });
    }

    if (body.decision === 'deny') {
      const responseNote =
        body.note?.trim() ||
        'Revisamos tu solicitud y por ahora no pudimos avanzar con la baja. Si necesitás ayuda, respondé a soporte y lo vemos con vos.';
      const now = new Date().toISOString();

      const { error: ticketError } = await adminClient
        .from('tickets')
        .update({
          status: 'closed',
          estado: 'cerrado',
          respuesta: responseNote,
          respondido_por: reviewer?.full_name || reviewer?.email || 'Admin Pulse',
          fecha_respuesta: now,
          updated_at: now,
        })
        .eq('id', ticket.id);

      if (ticketError) {
        throw ticketError;
      }

      const { error: notificationError } = await adminClient.from('notifications').insert({
        user_id: targetUser.id,
        title: 'Revisamos tu solicitud de baja',
        message: responseNote,
        type: 'info',
        category: 'user',
        is_urgent: false,
        action_url: '/dashboard/perfil',
        metadata: {
          request_id: ticket.id,
          decision: 'deny',
        },
        created_at: now,
        updated_at: now,
      });

      if (notificationError) {
        throw notificationError;
      }

      return jsonResponse(200, { decision: 'deny', request_id: ticket.id, user_id: targetUser.id });
    }

    const blockers = await getDeletionBlockers(adminClient, targetUser.id);

    if (blockers.length > 0) {
      return jsonResponse(409, { error: 'USER_DELETE_BLOCKED', blockers });
    }

    const { error: deleteTicketsError } = await adminClient
      .from('tickets')
      .delete()
      .eq('user_id', targetUser.id)
      .eq('category', 'account_deletion');

    if (deleteTicketsError) {
      throw deleteTicketsError;
    }

    await adminClient.from('notifications').delete().eq('user_id', targetUser.id);

    const { error: profileDeleteError } = await adminClient.from('users').delete().eq('id', targetUser.id);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    const deletedAuthUser = await deleteAuthUserIfPresent(adminClient, targetUser.id);

    return jsonResponse(200, {
      decision: 'approve',
      deleted_user_id: targetUser.id,
      deleted_email: targetUser.email,
      deleted_auth_user: deletedAuthUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: 'Tu sesión de administrador no está disponible.' });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: 'Solo un administrador puede revisar esta solicitud.' });
    }

    console.error('Error en review-account-deletion-request:', message);
    return jsonResponse(500, {
      error: 'No pudimos revisar la solicitud de baja desde el backend.',
    });
  }
});
