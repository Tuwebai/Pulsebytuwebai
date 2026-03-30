// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdminClient } from '../sync-ga4-metrics/request.ts';
import { getGoogleAccessToken } from '../sync-ga4-metrics/ga4.ts';
import { corsHeaders, jsonResponse, SyncGa4MetricsError } from '../sync-ga4-metrics/types.ts';

interface RealtimeRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

function extractBearerToken(authorization: string): string {
  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new SyncGa4MetricsError(401, 'Tu sesión no tiene permisos para consultar Pulse en vivo.', 'UNAUTHORIZED');
  }

  return token;
}

function parseRealtimeRows(rows: RealtimeRow[] | undefined) {
  return rows || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      throw new SyncGa4MetricsError(401, 'Tu sesión no tiene permisos para consultar Pulse en vivo.', 'UNAUTHORIZED');
    }

    const body = (await req.json().catch(() => null)) as { projectId?: string } | null;
    const projectId = body?.projectId?.trim();

    if (!projectId) {
      throw new SyncGa4MetricsError(400, 'Necesitamos saber qué proyecto querés consultar.', 'PROJECT_ID_REQUIRED');
    }

    const supabase = createSupabaseAdminClient();
    const jwt = extractBearerToken(authorization);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user?.id) {
      throw new SyncGa4MetricsError(401, 'Tu sesión no tiene permisos para consultar Pulse en vivo.', 'UNAUTHORIZED');
    }

    const [{ data: adminUser, error: adminUserError }, { data: project, error: projectError }] = await Promise.all([
      supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('projects').select('id, created_by, ga4_property_id').eq('id', projectId).maybeSingle(),
    ]);

    if (adminUserError) {
      throw adminUserError;
    }

    if (projectError) {
      throw projectError;
    }

    if (!project) {
      throw new SyncGa4MetricsError(404, 'No encontramos el proyecto para consultar.', 'PROJECT_NOT_FOUND');
    }

    const isAuthorizedAdmin = (adminUser as { role: string | null } | null)?.role === 'admin';

    if (!isAuthorizedAdmin && project.created_by !== user.id) {
      throw new SyncGa4MetricsError(403, 'No tenés permisos para consultar este proyecto.', 'FORBIDDEN');
    }

    if (!project.ga4_property_id) {
      throw new SyncGa4MetricsError(404, 'Todavía no encontramos una propiedad de Google Analytics activa.', 'PROJECT_NOT_READY');
    }

    const credentialsJson = Deno.env.get('GOOGLE_ANALYTICS_CREDENTIALS') || '';

    if (!credentialsJson) {
      throw new SyncGa4MetricsError(500, 'Falta configurar la conexión real con Google Analytics en el backend.', 'GA4_CREDENTIALS_MISSING');
    }

    const accessToken = await getGoogleAccessToken(credentialsJson);
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${project.ga4_property_id}:runRealtimeReport`;

    const [totalsResponse, pagesResponse, eventsResponse] = await Promise.all([
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }, { name: 'keyEvents' }],
        }),
      }),
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimensions: [{ name: 'unifiedScreenName' }],
          metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 5,
        }),
      }),
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'keyEvents' }],
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: 5,
        }),
      }),
    ]);

    if (!totalsResponse.ok || !pagesResponse.ok || !eventsResponse.ok) {
      throw new Error(
        `GA4 realtime error: ${totalsResponse.status}/${pagesResponse.status}/${eventsResponse.status}`,
      );
    }

    const [totalsRaw, pagesRaw, eventsRaw] = await Promise.all([
      totalsResponse.json(),
      pagesResponse.json(),
      eventsResponse.json(),
    ]);

    const totalRow = parseRealtimeRows((totalsRaw as { rows?: RealtimeRow[] }).rows)[0];
    const pageRows = parseRealtimeRows((pagesRaw as { rows?: RealtimeRow[] }).rows);
    const eventRows = parseRealtimeRows((eventsRaw as { rows?: RealtimeRow[] }).rows);

    return jsonResponse(200, {
      activeUsers: parseInt(totalRow?.metricValues?.[0]?.value || '0', 10),
      eventCount: parseInt(totalRow?.metricValues?.[1]?.value || '0', 10),
      keyEvents: parseInt(totalRow?.metricValues?.[2]?.value || '0', 10),
      topPages: pageRows.map((row) => ({
        label: row.dimensionValues?.[0]?.value || 'Página sin nombre',
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
        views: parseInt(row.metricValues?.[1]?.value || '0', 10),
      })),
      topEvents: eventRows.map((row) => ({
        name: row.dimensionValues?.[0]?.value || 'evento',
        count: parseInt(row.metricValues?.[0]?.value || '0', 10),
        keyEvents: parseInt(row.metricValues?.[1]?.value || '0', 10),
      })),
      sampledAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SyncGa4MetricsError) {
      return jsonResponse(error.status, { error: error.code, message: error.publicMessage });
    }

    console.error('[pulse-ga4-realtime]', error);
    return jsonResponse(500, {
      error: 'PULSE_GA4_REALTIME_FAILED',
      message: 'No pudimos consultar la actividad en vivo de tu web.',
    });
  }
});
