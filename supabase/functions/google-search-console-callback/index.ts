// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  GoogleSearchConsoleError,
  buildCallbackUrl,
  createSupabaseAdminClient,
  detectPropertyType,
  encryptRefreshToken,
  getGoogleConnectEnv,
  readSignedState,
  resolveMatchingSite,
} from '../google-search-console-connect/shared.ts';
import {
  normalizeErrorMessage,
  persistConnectionError,
  resolveErrorRedirectUrl,
  resolveReasonFromGoogleError,
} from './errorSupport.ts';

interface GoogleTokenResponse { access_token?: string; expires_in?: number; refresh_token?: string; scope?: string; token_type?: string; }

function redirectTo(url: string) {
  return Response.redirect(url, 302);
}

function buildExternalErrorCode(prefix: string, payload: string) {
  const sanitizedPayload = payload.trim().slice(0, 120);
  return `${prefix}:${sanitizedPayload || 'EMPTY_PAYLOAD'}`;
}

serve(async (req) => {
  const { appUrl, clientId, clientSecret, redirectUri } = getGoogleConnectEnv();

  try {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');
    const oauthError = requestUrl.searchParams.get('error');
    const oauthReason = oauthError === 'access_denied' ? 'access-denied' : 'unknown';
    const errorRedirectUrl = await resolveErrorRedirectUrl(state, appUrl, oauthReason);

    if (oauthError) {
      return redirectTo(errorRedirectUrl);
    }

    if (!code || !state) {
      throw new GoogleSearchConsoleError(400, 'No pudimos validar la conexión con Google.', 'INVALID_CALLBACK');
    }

    const signedState = await readSignedState<{ exp: number; projectId: string; returnAppUrl?: string; userId: string }>(state);
    const returnAppUrl = signedState.returnAppUrl || appUrl;
    const successUrl = buildCallbackUrl(returnAppUrl, 'connected');
    const propertyNotFoundUrl = buildCallbackUrl(returnAppUrl, 'property-not-found');

    if (!signedState.exp || signedState.exp < Date.now()) {
      throw new GoogleSearchConsoleError(400, 'La conexión con Google venció. Probá de nuevo.', 'STATE_EXPIRED');
    }

    const supabase = createSupabaseAdminClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, created_by, domain')
      .eq('id', signedState.projectId)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    if (!project || project.created_by !== signedState.userId || !project.domain) {
      throw new GoogleSearchConsoleError(404, 'No encontramos el proyecto para completar Google.', 'PROJECT_NOT_FOUND');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const payload = await tokenResponse.text().catch(() => '');
      console.error('[google-search-console-callback] token-exchange-failed', {
        status: tokenResponse.status,
      });
      throw new GoogleSearchConsoleError(
        500,
        'No pudimos completar la autorización con Google.',
        buildExternalErrorCode('TOKEN_EXCHANGE_FAILED', payload),
      );
    }

    const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenPayload.access_token || !tokenPayload.refresh_token) {
      throw new GoogleSearchConsoleError(
        500,
        'Google no devolvió el acceso completo para guardar esta conexión.',
        'REFRESH_TOKEN_MISSING',
      );
    }

    const siteResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    if (!siteResponse.ok) {
      const payload = await siteResponse.text().catch(() => '');
      console.error('[google-search-console-callback] sites-list-failed', {
        status: siteResponse.status,
      });
      throw new GoogleSearchConsoleError(
        500,
        'No pudimos consultar tus propiedades de Google.',
        buildExternalErrorCode('SITES_LIST_FAILED', payload),
      );
    }

    const sitePayload = (await siteResponse.json()) as { siteEntry?: Array<{ permissionLevel?: string; siteUrl?: string }> };
    const matchedSite = resolveMatchingSite(project.domain, sitePayload.siteEntry ?? []);

    if (!matchedSite?.siteUrl) {
      await supabase.from('search_console_credentials').delete().eq('project_id', project.id);
      await supabase.from('search_console_properties').upsert(
        {
          project_id: project.id,
          site_url: null,
          property_type: null,
          permission_level: null,
          google_account_email: null,
          connection_status: 'property_not_found',
          connected_at: null,
          last_validated_at: new Date().toISOString(),
          last_sync_status: 'idle',
          last_sync_error: 'SEARCH_CONSOLE_PROPERTY_NOT_FOUND',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      );

      return redirectTo(propertyNotFoundUrl);
    }

    const tokenInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(tokenPayload.access_token)}`,
    );
    const tokenInfo = (await tokenInfoResponse.json().catch(() => null)) as { email?: string; scope?: string } | null;
    const encryptedRefreshToken = await encryptRefreshToken(tokenPayload.refresh_token);

    const { data: propertyRecord, error: propertyError } = await supabase
      .from('search_console_properties')
      .upsert(
        {
          project_id: project.id,
          site_url: matchedSite.siteUrl,
          property_type: detectPropertyType(matchedSite.siteUrl),
          permission_level: matchedSite.permissionLevel ?? null,
          google_account_email: tokenInfo?.email ?? null,
          connection_status: 'connected',
          connected_at: new Date().toISOString(),
          last_validated_at: new Date().toISOString(),
          last_sync_status: 'idle',
          last_sync_error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' },
      )
      .select('id')
      .single();

    if (propertyError || !propertyRecord?.id) {
      throw propertyError ?? new Error('PROPERTY_UPSERT_FAILED');
    }

    const { error: credentialError } = await supabase.from('search_console_credentials').upsert(
      {
        project_id: project.id,
        property_id: propertyRecord.id,
        refresh_token_ciphertext: encryptedRefreshToken.refreshTokenCiphertext,
        refresh_token_iv: encryptedRefreshToken.refreshTokenIv,
        scopes: (tokenInfo?.scope ?? tokenPayload.scope ?? '')
          .split(/\s+/)
          .map((scope) => scope.trim())
          .filter(Boolean),
        token_expires_at: tokenPayload.expires_in
          ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' },
    );

    if (credentialError) {
      throw credentialError;
    }

    return redirectTo(successUrl);
  } catch (error) {
    const requestUrl = new URL(req.url);
    const rawErrorCode = error instanceof GoogleSearchConsoleError ? error.code : normalizeErrorMessage(error);
    const separatorIndex = rawErrorCode.indexOf(':');
    const errorCode = separatorIndex >= 0 ? rawErrorCode.slice(0, separatorIndex) : rawErrorCode;
    const errorPayload = separatorIndex >= 0 ? rawErrorCode.slice(separatorIndex + 1) : '';
    const errorReason = resolveReasonFromGoogleError(errorCode, errorPayload);
    const rawState = requestUrl.searchParams.get('state');
    const errorRedirectUrl = await resolveErrorRedirectUrl(rawState, appUrl, errorReason);

    if (rawState) {
      try {
        const signedState = await readSignedState<{
          exp: number;
          projectId: string;
          returnAppUrl?: string;
          userId: string;
      }>(rawState);
      await persistConnectionError(signedState.projectId, errorCode);
      } catch (stateError) {
        const message = stateError instanceof Error ? stateError.message : 'UNKNOWN_ERROR';
        console.error('[google-search-console-callback] persist-error', message);
      }
    }

    if (!(error instanceof GoogleSearchConsoleError)) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      console.error('[google-search-console-callback]', message);
    }

    return redirectTo(errorRedirectUrl);
  }
});
