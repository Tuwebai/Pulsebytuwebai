import { getGoogleConnectEnv } from '../google-search-console-connect/shared.ts';
import { SyncSearchConsoleError } from './types.ts';

interface GoogleTokenResponse {
  access_token?: string;
}

interface SearchAnalyticsRow {
  clicks?: number;
  ctr?: number;
  impressions?: number;
  keys?: string[];
  position?: number;
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function exchangeRefreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleConnectEnv();
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    const payload = await tokenResponse.text().catch(() => '');
    console.error('[sync-search-console-metrics] token', payload);
    throw new SyncSearchConsoleError(500, 'No pudimos renovar la conexión con Google.', 'TOKEN_REFRESH_FAILED');
  }

  const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenPayload.access_token) {
    throw new SyncSearchConsoleError(500, 'Google no devolvió un acceso válido para sincronizar.', 'ACCESS_TOKEN_MISSING');
  }

  return tokenPayload.access_token;
}

export async function fetchDailyMetrics(siteUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 25000,
      }),
    },
  );

  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    console.error('[sync-search-console-metrics] searchAnalytics', payload);
    throw new SyncSearchConsoleError(500, 'No pudimos consultar las métricas de Google Search Console.', 'SEARCH_ANALYTICS_FAILED');
  }

  const payload = (await response.json()) as { rows?: SearchAnalyticsRow[] };
  const metricsByDate = new Map<string, { clicks: number; ctr: number; impressions: number; position: number; raw: SearchAnalyticsRow }>();

  for (const row of payload.rows || []) {
    const metricDate = row.keys?.[0];

    if (!metricDate) {
      continue;
    }

    metricsByDate.set(metricDate, {
      clicks: Math.round(toNumber(row.clicks)),
      ctr: toNumber(row.ctr),
      impressions: Math.round(toNumber(row.impressions)),
      position: toNumber(row.position),
      raw: row,
    });
  }

  return metricsByDate;
}
