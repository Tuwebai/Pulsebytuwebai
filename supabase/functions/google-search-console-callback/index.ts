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

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface SearchConsoleSiteEntry {
  permissionLevel?: string;
  siteUrl?: string;
}

interface SignedStatePayload {
  exp: number;
  projectId: string;
  returnAppUrl?: string;
  userId: string;
}

function redirectTo(url: string) {
  return Response.redirect(url, 302);
}

serve(async (req) => {
  const { appUrl, clientId, clientSecret, redirectUri } = getGoogleConnectEnv();
  const defaultErrorUrl = buildCallbackUrl(appUrl, 'error');

  try {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');
    const oauthError = requestUrl.searchParams.get('error');

    if (oauthError) {
      return redirectTo(defaultErrorUrl);
    }

    if (!code || !state) {
      throw new GoogleSearchConsoleError(400, 'No pudimos validar la conexión con Google.', 'INVALID_CALLBACK');
    }

    const signedState = await readSignedState<SignedStatePayload>(state);
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
      console.error('[google-search-console-callback] token', payload);
      throw new GoogleSearchConsoleError(500, 'No pudimos completar la autorización con Google.', 'TOKEN_EXCHANGE_FAILED');
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
      console.error('[google-search-console-callback] sites.list', payload);
      throw new GoogleSearchConsoleError(500, 'No pudimos consultar tus propiedades de Google.', 'SITES_LIST_FAILED');
    }

    const sitePayload = (await siteResponse.json()) as { siteEntry?: SearchConsoleSiteEntry[] };
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
    if (!(error instanceof GoogleSearchConsoleError)) {
      console.error('[google-search-console-callback]', error);
    }

    return redirectTo(defaultErrorUrl);
  }
});
