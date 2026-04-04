// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  GOOGLE_SEARCH_CONSOLE_SCOPE,
  GoogleSearchConsoleError,
  corsHeaders,
  createSignedState,
  ensureAuthorizedProject,
  getGoogleConnectEnv,
  jsonResponse,
  resolveReturnAppUrl,
} from './shared.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' });
  }

  try {
    const body = (await req.json().catch(() => null)) as { projectId?: string; returnToOrigin?: string } | null;
    const projectId = body?.projectId?.trim();

    if (!projectId) {
      throw new GoogleSearchConsoleError(
        400,
        'Necesitamos un proyecto válido para conectar Google.',
        'PROJECT_ID_REQUIRED',
      );
    }

    const { clientId, redirectUri } = getGoogleConnectEnv();
    const { project, user } = await ensureAuthorizedProject(req, projectId);
    const returnAppUrl = resolveReturnAppUrl(body?.returnToOrigin);
    const state = await createSignedState({
      exp: Date.now() + 1000 * 60 * 10,
      projectId: project.id,
      returnAppUrl,
      userId: user.id,
    });

    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', GOOGLE_SEARCH_CONSOLE_SCOPE);
    authorizationUrl.searchParams.set('access_type', 'offline');
    authorizationUrl.searchParams.set('prompt', 'consent');
    authorizationUrl.searchParams.set('include_granted_scopes', 'true');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('login_hint', user.email ?? '');

    return jsonResponse(200, {
      authorizationUrl: authorizationUrl.toString(),
    });
  } catch (error) {
    if (error instanceof GoogleSearchConsoleError) {
      return jsonResponse(error.status, { error: error.code, message: error.publicMessage });
    }

    console.error('[google-search-console-connect]', error);
    return jsonResponse(500, {
      error: 'GOOGLE_CONNECT_FAILED',
      message: 'No pudimos iniciar la conexión con Google.',
    });
  }
});
