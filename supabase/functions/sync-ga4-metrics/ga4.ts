import { type Ga4Metrics, type ProjectRow } from './types.ts';

const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  const normalized = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const binary = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binary.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );
}

export async function getGoogleAccessToken(credentialsJson: string): Promise<string> {
  const credentials = JSON.parse(credentialsJson) as {
    client_email?: string;
    private_key?: string;
    token_uri?: string;
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('GOOGLE_ANALYTICS_CREDENTIALS no tiene client_email/private_key validos.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: GA4_SCOPE,
    aud: credentials.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const privateKey = await importPrivateKey(credentials.private_key);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(unsignedToken));
  const signedJwt = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`No pudimos obtener access token de Google: ${tokenResponse.status} ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error('Google no devolvio access_token.');
  }

  return tokenData.access_token as string;
}

const CONSULTATION_EVENT_NAMES = new Set([
  'contact',
  'contact_form_submit',
  'form_submit',
  'generate_lead',
  'submit_form',
]);

interface Ga4ReportRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

interface Ga4ReportResponse {
  rows?: Ga4ReportRow[];
  totals?: Array<{ metricValues?: Array<{ value?: string }> }>;
}

function parseInteger(value: string | undefined): number {
  return parseInt(value || '0', 10);
}

function parseFloatValue(value: string | undefined): number {
  return parseFloat(value || '0');
}

function parseTotalsReport(raw: unknown) {
  const response = raw as Ga4ReportResponse;
  const metrics = response.totals?.[0]?.metricValues || [];

  return {
    sessions: parseInteger(metrics[0]?.value),
    avgSessionSec: Math.round(parseFloatValue(metrics[1]?.value)),
  };
}

function parseTopPagesReport(raw: unknown) {
  const response = raw as Ga4ReportResponse;
  const rows = response.rows || [];

  return rows.slice(0, 5).map((row) => ({
    label: row.dimensionValues?.[1]?.value || null,
    path: row.dimensionValues?.[0]?.value || '/',
    visits: parseInteger(row.metricValues?.[0]?.value),
  }));
}

function parseConsultationEventsReport(raw: unknown) {
  const response = raw as Ga4ReportResponse;
  const rows = response.rows || [];

  return rows.reduce((total, row) => {
    const rawName = row.dimensionValues?.[0]?.value?.trim().toLowerCase() || '';

    if (!CONSULTATION_EVENT_NAMES.has(rawName)) {
      return total;
    }

    return total + parseInteger(row.metricValues?.[0]?.value);
  }, 0);
}

export async function fetchGa4Metrics(propertyId: string, date: string, accessToken: string): Promise<Ga4Metrics> {
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const requestHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const [totalsResponse, pagesResponse, eventsResponse] = await Promise.all([
    fetch(endpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        dateRanges: [{ startDate: date, endDate: date }],
        metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }],
      }),
    }),
    fetch(endpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        dateRanges: [{ startDate: date, endDate: date }],
        metrics: [{ name: 'screenPageViews' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
    }),
    fetch(endpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        dateRanges: [{ startDate: date, endDate: date }],
        metrics: [{ name: 'eventCount' }],
        dimensions: [{ name: 'eventName' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: Array.from(CONSULTATION_EVENT_NAMES),
            },
          },
        },
        limit: 20,
      }),
    }),
  ]);

  if (!totalsResponse.ok) {
    throw new Error(`GA4 totals API error: ${totalsResponse.status} ${await totalsResponse.text()}`);
  }

  if (!pagesResponse.ok) {
    throw new Error(`GA4 pages API error: ${pagesResponse.status} ${await pagesResponse.text()}`);
  }

  if (!eventsResponse.ok) {
    throw new Error(`GA4 events API error: ${eventsResponse.status} ${await eventsResponse.text()}`);
  }

  const totalsRaw = await totalsResponse.json();
  const pagesRaw = await pagesResponse.json();
  const eventsRaw = await eventsResponse.json();
  const totals = parseTotalsReport(totalsRaw);
  const topPages = parseTopPagesReport(pagesRaw);
  const conversions = parseConsultationEventsReport(eventsRaw);

  return {
    sessions: totals.sessions,
    conversions,
    avgSessionSec: totals.avgSessionSec,
    topPage: topPages[0]?.path || null,
    topPageViews: topPages[0]?.visits || 0,
    topPages,
    raw: {
      totals: totalsRaw,
      topPages: pagesRaw,
      consultationEvents: eventsRaw,
    },
  };
}

export function buildDryRunMetrics(project: ProjectRow, date: string): Ga4Metrics {
  const seed = project.id.replace(/-/g, '').slice(0, 8);
  const numericSeed = parseInt(seed, 16);
  const sessions = 20 + (numericSeed % 120);
  const conversions = numericSeed % 7;
  const topPages = [
    { path: '/', visits: Math.max(8, Math.round(sessions * 0.4)) },
    { path: '/servicios', visits: Math.max(4, Math.round(sessions * 0.25)) },
    { path: '/contacto', visits: Math.max(2, Math.round(sessions * 0.15)) },
  ];

  return {
    sessions,
    conversions,
    avgSessionSec: 60 + (numericSeed % 180),
    topPage: topPages[0].path,
    topPageViews: topPages[0].visits,
    topPages,
    raw: { mode: 'dry_run', date, projectId: project.id, domain: project.domain },
  };
}
