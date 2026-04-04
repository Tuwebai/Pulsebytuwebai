// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const GOOGLE_SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
} as const;

export class GoogleSearchConsoleError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string,
    public readonly code: string,
  ) {
    super(code);
  }
}

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new GoogleSearchConsoleError(
      500,
      'Falta configurar la conexión segura con Google en el backend.',
      'ENV_MISSING',
    );
  }

  return value;
}

export function createSupabaseAdminClient() {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function extractBearerToken(authorization: string) {
  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new GoogleSearchConsoleError(401, 'Tu sesión no tiene permisos para conectar Google.', 'UNAUTHORIZED');
  }

  return token;
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function createSignedState(payload: Record<string, unknown>) {
  const secret = getRequiredEnv('GOOGLE_SEARCH_CONSOLE_STATE_SECRET');
  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signatureBytes = await sha256(`${encodedPayload}.${secret}`);
  return `${encodedPayload}.${toBase64Url(signatureBytes)}`;
}

export async function readSignedState<T>(state: string): Promise<T> {
  const secret = getRequiredEnv('GOOGLE_SEARCH_CONSOLE_STATE_SECRET');
  const [encodedPayload, encodedSignature] = state.split('.', 2);

  if (!encodedPayload || !encodedSignature) {
    throw new GoogleSearchConsoleError(400, 'No pudimos validar la conexión con Google.', 'INVALID_STATE');
  }

  const expectedSignature = toBase64Url(await sha256(`${encodedPayload}.${secret}`));

  if (expectedSignature !== encodedSignature) {
    throw new GoogleSearchConsoleError(400, 'No pudimos validar la conexión con Google.', 'INVALID_STATE');
  }

  const payloadText = new TextDecoder().decode(fromBase64Url(encodedPayload));
  const payload = JSON.parse(payloadText) as T;
  return payload;
}

export function getGoogleConnectEnv() {
  return {
    appUrl: getRequiredEnv('GOOGLE_SEARCH_CONSOLE_APP_URL'),
    clientId: getRequiredEnv('GOOGLE_SEARCH_CONSOLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET'),
    encryptionKey: getRequiredEnv('GOOGLE_SEARCH_CONSOLE_ENCRYPTION_KEY'),
    redirectUri: getRequiredEnv('GOOGLE_SEARCH_CONSOLE_REDIRECT_URI'),
  };
}

function normalizeArrayBuffer(input: Uint8Array<ArrayBufferLike>) {
  return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
}

export async function encryptRefreshToken(refreshToken: string) {
  const { encryptionKey } = getGoogleConnectEnv();
  const keyMaterial = fromBase64Url(encryptionKey);

  if (keyMaterial.byteLength !== 32) {
    throw new GoogleSearchConsoleError(500, 'La conexión segura con Google quedó mal configurada.', 'INVALID_KEY');
  }

  const key = await crypto.subtle.importKey('raw', normalizeArrayBuffer(keyMaterial), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: normalizeArrayBuffer(iv) },
    key,
    new TextEncoder().encode(refreshToken),
  );

  return {
    refreshTokenCiphertext: toBase64Url(new Uint8Array(ciphertext)),
    refreshTokenIv: toBase64Url(iv),
  };
}

export async function ensureAuthorizedProject(req: Request, projectId: string) {
  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    throw new GoogleSearchConsoleError(401, 'Tu sesión no tiene permisos para conectar Google.', 'UNAUTHORIZED');
  }

  const adminClient = createSupabaseAdminClient();
  const jwt = extractBearerToken(authorization);
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(jwt);

  if (authError || !user?.id) {
    throw new GoogleSearchConsoleError(401, 'Tu sesión no tiene permisos para conectar Google.', 'UNAUTHORIZED');
  }

  const [{ data: appUser, error: appUserError }, { data: project, error: projectError }] = await Promise.all([
    adminClient.from('users').select('role, website, website_status').eq('id', user.id).maybeSingle(),
    adminClient.from('projects').select('id, created_by, domain').eq('id', projectId).maybeSingle(),
  ]);

  if (appUserError) {
    throw appUserError;
  }

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    throw new GoogleSearchConsoleError(404, 'No encontramos el proyecto para conectar Google.', 'PROJECT_NOT_FOUND');
  }

  const isAuthorizedAdmin = (appUser as { role?: string | null } | null)?.role === 'admin';

  if (!isAuthorizedAdmin && project.created_by !== user.id) {
    throw new GoogleSearchConsoleError(403, 'No tenés permisos para conectar Google en este proyecto.', 'FORBIDDEN');
  }

  const fallbackDomain = (appUser as { website?: string | null } | null)?.website ?? null;
  const websiteStatus = (appUser as { website_status?: string | null } | null)?.website_status ?? null;
  const resolvedDomain = project.domain ?? fallbackDomain;

  if (!resolvedDomain || websiteStatus === 'pending_review') {
    throw new GoogleSearchConsoleError(
      409,
      'Primero necesitamos una web lista para avanzar con la conexión de Google.',
      'PROJECT_NOT_READY',
    );
  }

  return {
    adminClient,
    project: {
      createdBy: project.created_by as string | null,
      domain: resolvedDomain,
      id: project.id as string,
    },
    user,
  };
}

export function buildCallbackUrl(appUrl: string, status: 'connected' | 'property-not-found' | 'error') {
  const baseUrl = appUrl.replace(/\/+$/, '');
  return `${baseUrl}/dashboard/google?google=${status}`;
}

export function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
}

export function detectPropertyType(siteUrl: string): 'domain' | 'url_prefix' {
  return siteUrl.startsWith('sc-domain:') ? 'domain' : 'url_prefix';
}

export function resolveMatchingSite(
  requestedDomain: string,
  siteEntries: Array<{ permissionLevel?: string; siteUrl?: string }>,
) {
  const normalizedDomain = normalizeDomain(requestedDomain);

  let bestMatch: { permissionLevel?: string; siteUrl?: string } | null = null;
  let bestScore = -1;

  for (const entry of siteEntries) {
    const siteUrl = entry.siteUrl?.trim();

    if (!siteUrl) {
      continue;
    }

    let score = -1;

    if (siteUrl === `sc-domain:${normalizedDomain}`) {
      score = 300;
    } else if (siteUrl === `https://${normalizedDomain}/`) {
      score = 250;
    } else if (siteUrl === `http://${normalizedDomain}/`) {
      score = 240;
    } else if (siteUrl === `https://www.${normalizedDomain}/`) {
      score = 230;
    } else if (siteUrl === `http://www.${normalizedDomain}/`) {
      score = 220;
    } else if (siteUrl.includes(normalizedDomain)) {
      score = 100;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

