import { GoogleSearchConsoleError } from '../google-search-console-connect/shared.ts';
import { decryptRefreshToken } from './crypto.ts';
import { exchangeRefreshToken, fetchDailyMetrics, fetchTopDimensionMetrics } from './google.ts';
import {
  createSyncRun,
  finishSyncRun,
  getConnectedProperties,
  replaceDimensionMetrics,
  updatePropertySyncState,
  upsertDailyMetrics,
} from './persistence.ts';
import { buildDateWindow } from './request.ts';
import { SyncSearchConsoleError, type SearchConsoleDailyMetricRow, type SearchConsoleDimensionMetricRow } from './types.ts';

function getDimensionWindows(syncDays: number) {
  return [1, 7, 28, 90].filter((days) => days <= syncDays);
}

export async function runSearchConsoleSync(projectId: string | null, syncDays: number) {
  const targets = await getConnectedProperties(projectId);
  const dateWindow = buildDateWindow(syncDays);
  const summary = {
    dimensionRowsUpserted: 0,
    endDate: dateWindow.endDate,
    failedProjects: 0,
    processedProjects: 0,
    rowsUpserted: 0,
    startDate: dateWindow.startDate,
    status: 'success',
  };

  for (const target of targets) {
    let syncRunId: string | null = null;

    try {
      syncRunId = await createSyncRun(target.property.project_id, target.property.id);
      const refreshToken = await decryptRefreshToken(
        target.credentials.refresh_token_ciphertext,
        target.credentials.refresh_token_iv,
      );
      const accessToken = await exchangeRefreshToken(refreshToken);
      const [metricsByDate, ...windowDimensionResults] = await Promise.all([
        fetchDailyMetrics(target.property.site_url, accessToken, dateWindow.startDate, dateWindow.endDate),
        ...getDimensionWindows(syncDays).flatMap((days) => {
          const window = buildDateWindow(days);
          return [
            fetchTopDimensionMetrics(target.property.site_url, accessToken, window.startDate, window.endDate, 'query'),
            fetchTopDimensionMetrics(target.property.site_url, accessToken, window.startDate, window.endDate, 'page'),
          ];
        }),
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
          project_id: target.property.project_id,
          property_id: target.property.id,
          raw_payload: metric?.raw ? { row: metric.raw } : {},
          updated_at: updatedAt,
        };
      });

      const dimensionRowsByWindow = getDimensionWindows(syncDays).map((days, index) => {
        const window = buildDateWindow(days);
        const topQueries = windowDimensionResults[index * 2] ?? [];
        const topPages = windowDimensionResults[index * 2 + 1] ?? [];
        const rows: SearchConsoleDimensionMetricRow[] = [
          ...topQueries.map((row) => ({
            clicks: row.clicks,
            ctr: row.ctr,
            dimension_key: row.dimensionKey,
            dimension_type: 'query' as const,
            impressions: row.impressions,
            metric_window_from: window.startDate,
            metric_window_to: window.endDate,
            position: row.position,
            project_id: target.property.project_id,
            property_id: target.property.id,
            updated_at: updatedAt,
          })),
          ...topPages.map((row) => ({
            clicks: row.clicks,
            ctr: row.ctr,
            dimension_key: row.dimensionKey,
            dimension_type: 'page' as const,
            impressions: row.impressions,
            metric_window_from: window.startDate,
            metric_window_to: window.endDate,
            position: row.position,
            project_id: target.property.project_id,
            property_id: target.property.id,
            updated_at: updatedAt,
          })),
        ];

        return {
          days,
          rows,
          topPages,
          topQueries,
          window,
        };
      });

      await upsertDailyMetrics(rows);
      for (const entry of dimensionRowsByWindow) {
        await replaceDimensionMetrics(target.property.project_id, entry.window.startDate, entry.window.endDate, entry.rows);
      }

      const dimensionRows = dimensionRowsByWindow.flatMap((entry) => entry.rows);
      await updatePropertySyncState(target.property.project_id, 'success', null);
      await finishSyncRun(syncRunId, 'success', rows.length + dimensionRows.length, null, null, {
        dimensionWindows: dimensionRowsByWindow.map((entry) => ({
          days: entry.days,
          pages: entry.topPages.length,
          queries: entry.topQueries.length,
        })),
        endDate: dateWindow.endDate,
        startDate: dateWindow.startDate,
      });

      summary.processedProjects += 1;
      summary.rowsUpserted += rows.length;
      summary.dimensionRowsUpserted += dimensionRows.length;
    } catch (error) {
      const syncError =
        error instanceof SyncSearchConsoleError
          ? error
          : error instanceof GoogleSearchConsoleError
            ? new SyncSearchConsoleError(error.status, error.publicMessage, error.code)
            : new SyncSearchConsoleError(500, 'No pudimos sincronizar las métricas de Google.', 'SYNC_SEARCH_CONSOLE_FAILED');

      await updatePropertySyncState(target.property.project_id, 'error', syncError.code).catch((stateError) => {
        console.error('[sync-search-console-metrics] property-state', stateError);
      });

      if (syncRunId) {
        await finishSyncRun(syncRunId, 'error', 0, syncError.code, syncError.publicMessage, {}).catch((runError) => {
          console.error('[sync-search-console-metrics] sync-run', runError);
        });
      }

      summary.failedProjects += 1;
      summary.status = summary.processedProjects > 0 ? 'partial' : 'error';
      console.error('[sync-search-console-metrics] project', target.property.project_id, error);
    }
  }

  if (summary.processedProjects === 0) {
    throw new SyncSearchConsoleError(409, 'Todavía no encontramos propiedades conectadas para sincronizar.', 'PROPERTY_NOT_CONNECTED');
  }

  return summary;
}
