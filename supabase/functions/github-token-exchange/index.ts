// @ts-expect-error - Deno module resolution
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;

  const configuredOrigins = (Deno.env.get('GITHUB_ALLOWED_ORIGINS') || Deno.env.get('PULSE_PUBLIC_URL') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const defaultOrigins = ['http://localhost:8083', 'http://127.0.0.1:8083'];
  const allowedOrigins = new Set([...configuredOrigins, ...defaultOrigins]);

  return allowedOrigins.has(origin);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED' });
  }

  if (!isAllowedOrigin(req.headers.get('origin'))) {
    return jsonResponse(403, { error: 'ORIGIN_NOT_ALLOWED' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'INVALID_JSON' });
  }

  if (!isPlainObject(body)) {
    return jsonResponse(400, { error: 'INVALID_PAYLOAD' });
  }

  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const state = typeof body.state === 'string' ? body.state.trim() : '';

  if (!code) {
    return jsonResponse(400, { error: 'MISSING_CODE' });
  }

  try {
    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');
    const githubRedirectUri = Deno.env.get('GITHUB_REDIRECT_URI') || 'http://localhost:8083/auth/github/callback';

    if (!githubClientId || !githubClientSecret) {
      return jsonResponse(500, {
        error: 'GITHUB_OAUTH_CONFIG_MISSING',
      });
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        redirect_uri: githubRedirectUri,
        state,
      }),
    });

    const tokenData = await tokenResponse.json().catch(() => null);

    if (!tokenResponse.ok) {
      return jsonResponse(400, {
        error: 'GITHUB_TOKEN_EXCHANGE_FAILED',
      });
    }

    if (!tokenData || typeof tokenData !== 'object' || 'error' in tokenData) {
      return jsonResponse(400, {
        error: 'GITHUB_OAUTH_ERROR',
      });
    }

    return jsonResponse(200, tokenData as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.error('github-token-exchange failed:', message);
    return jsonResponse(500, {
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
});
