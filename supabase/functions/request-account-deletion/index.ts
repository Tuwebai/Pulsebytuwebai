import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

import {
  corsHeaders,
  createDeletionTicket,
  ensureAuthenticatedClient,
  ensureNoOpenDeletionRequest,
  isPlainObject,
  jsonResponse,
  notifyAdminsAboutDeletionRequest,
} from './shared.ts';

function isValidBody(body: unknown): body is { reason: string } {
  return isPlainObject(body) && typeof body.reason === 'string' && body.reason.trim().length >= 10;
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
    return jsonResponse(400, { error: 'REQUEST_REASON_INVALID' });
  }

  try {
    const { adminClient, user } = await ensureAuthenticatedClient(authorization);
    const reason = body.reason.trim();

    await ensureNoOpenDeletionRequest(adminClient, user.id);

    const request = await createDeletionTicket(adminClient, user, reason);
    await notifyAdminsAboutDeletionRequest(adminClient, user, request.id);

    return jsonResponse(200, {
      request: {
        id: request.id,
        status: request.status,
        created_at: request.created_at,
        description: request.description ?? request.mensaje ?? null,
        respuesta: request.respuesta ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: 'Necesitás una sesión activa para continuar.' });
    }

    if (message === 'ADMIN_NOT_ALLOWED') {
      return jsonResponse(403, { error: 'Este flujo está reservado para cuentas cliente.' });
    }

    if (message === 'USER_NOT_FOUND') {
      return jsonResponse(404, { error: 'No encontramos tu cuenta operativa en Pulse.' });
    }

    if (message === 'REQUEST_ALREADY_OPEN') {
      return jsonResponse(409, {
        error: 'Ya tenés una solicitud de baja en revisión. Cuando quede resuelta vas a poder decidir el próximo paso.',
      });
    }

    console.error('Error en request-account-deletion:', message);
    return jsonResponse(500, {
      error: 'No pudimos enviar tu solicitud de baja. Intentá nuevamente en unos minutos.',
    });
  }
});
