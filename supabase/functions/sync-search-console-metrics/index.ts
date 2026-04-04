// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleSearchConsoleError } from '../google-search-console-connect/shared.ts';
import { decryptRefreshToken } from './crypto.ts';
import { exchangeRefreshToken, fetchDailyMetrics, fetchTopDimensionMetrics } from './google.ts';
import { createSyncRun, finishSyncRun, getConnectedProperty, replaceDimensionMetrics, updatePropertySyncState, upsertDailyMetrics } from './persistence.ts';
import { buildDateWindow, resolveRequestContext } from './request.ts';
import { corsHeaders, jsonResponse, SyncSearchConsoleError, type SearchConsoleDailyMetricRow, type SearchConsoleDimensionMetricRow } from './types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' });
  }

  let syncRunId: string | null = null;
  let projectId: string | null = null;

  try {
    const requestContext = await resolveRequestContext(req);
    projectId = requestContext.projectId;

    const { property, credentials } = await getConnectedProperty(requestContext.projectId);
    const dateWindow = buildDateWindow(requestContext.syncDays);
    syncRunId = await createSyncRun(property.project_id, property.id);

    const refreshToken = await decryptRefreshToken(credentials.refresh_token_ciphertext, credentials.refresh_token_iv);
    const accessToken = await exchangeRefreshToken(refreshToken);
    const [metricsByDate, topQueries, topPages] = await Promise.all([
      fetchDailyMetrics(property.site_url, accessToken, dateWindow.startDate, dateWindow.endDate),
      fetchTopDimensionMetrics(property.site_url, accessToken, dateWindow.startDate, dateWindow.endDate, 'query'),
      fetchTopDimensionMetrics(property.site_url, accessToken, dateWindow.startDate, dateWindow.endDate, 'page'),
    ]);
    const updatedAt = new Date().toISOString();

    const rows: SearchConsoleDailyMetricRow[] = dateWindow.dates.map((metricDate) => {
      const metric = metricsByDate.get(metricDate);

      return {
        clicks: metric?.clicks ?? 0,
        ctr: metric?.ctr ?? 0,
        impressions: metric?.impressions ?? 0,
        metric_date: metricDate,
        position: metric?.position ?? 0,
        project_id: property.project_id,
        property_id: property.id,
        raw_payload: metric?.raw ? { row: metric.raw } : {},
        updated_at: updatedAt,
      };
    });

    const dimensionRows: SearchConsoleDimensionMetricRow[] = [
      ...topQueries.map((row) => ({
        clicks: row.clicks,
        ctr: row.ctr,
        dimension_key: row.dimensionKey,
        dimension_type: 'query' as const,
        impressions: row.impressions,
        metric_window_from: dateWindow.startDate,
        metric_window_to: dateWindow.endDate,
        position: row.position,
        project_id: property.project_id,
        property_id: property.id,
        updated_at: updatedAt,
      })),
      ...topPages.map((row) => ({
        clicks: row.clicks,
        ctr: row.ctr,
        dimension_key: row.dimensionKey,
        dimension_type: 'page' as const,
        impressions: row.impressions,
        metric_window_from: dateWindow.startDate,
        metric_window_to: dateWindow.endDate,
        position: row.position,
        project_id: property.project_id,
        property_id: property.id,
        updated_at: updatedAt,
      })),
    ];

    await upsertDailyMetrics(rows);
    await replaceDimensionMetrics(property.project_id, dateWindow.startDate, dateWindow.endDate, dimensionRows);
    await updatePropertySyncState(property.project_id, 'success', null);
    await finishSyncRun(syncRunId, 'success', rows.length + dimensionRows.length, null, null, {
      pages: topPages.length,
      queries: topQueries.length,
      endDate: dateWindow.endDate,
      startDate: dateWindow.startDate,
    });

    return jsonResponse(200, {
      endDate: dateWindow.endDate,
      projectId: property.project_id,
      dimensionRowsUpserted: dimensionRows.length,
      rowsUpserted: rows.length,
      startDate: dateWindow.startDate,
      status: 'success',
    });
  } catch (error) {
    const syncError =
      error instanceof SyncSearchConsoleError
        ? error
        : error instanceof GoogleSearchConsoleError
          ? new SyncSearchConsoleError(error.status, error.publicMessage, error.code)
        : new SyncSearchConsoleError(500, 'No pudimos sincronizar las métricas de Google.', 'SYNC_SEARCH_CONSOLE_FAILED');

    if (projectId) {
      await updatePropertySyncState(projectId, 'error', syncError.code).catch((stateError) => {
        console.error('[sync-search-console-metrics] property-state', stateError);
      });
    }

    if (syncRunId) {
      await finishSyncRun(syncRunId, 'error', 0, syncError.code, syncError.publicMessage, {}).catch((runError) => {
        console.error('[sync-search-console-metrics] sync-run', runError);
      });
    }

    if (!(error instanceof SyncSearchConsoleError)) {
      console.error('[sync-search-console-metrics]', error);
    }

    return jsonResponse(syncError.status, {
      error: syncError.code,
      message: syncError.publicMessage,
    });
  }
});
