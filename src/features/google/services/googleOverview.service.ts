import { getGoogleSearchConsoleMetricsByRange } from '@/api/googleSearchConsole.api';
import type { GoogleSearchConsoleConnection, GoogleSearchConsoleMetricRow, GoogleSearchConsoleOverview } from '@/data/types/google';

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(days: number) {
  const to = new Date();
  to.setUTCDate(to.getUTCDate() - 1);
  to.setUTCHours(0, 0, 0, 0);

  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
}

function getPreviousDateRange(from: string, days: number) {
  const fromDate = new Date(`${from}T00:00:00Z`);
  fromDate.setUTCDate(fromDate.getUTCDate() - days);
  const toDate = new Date(fromDate);
  toDate.setUTCDate(toDate.getUTCDate() + (days - 1));

  return {
    from: toIsoDate(fromDate),
    to: toIsoDate(toDate),
  };
}

function calcDelta(current: number, previous: number) {
  if (previous <= 0) {
    return null;
  }

  const value = Math.round(((current - previous) / previous) * 1000) / 10;
  return Number.isFinite(value) ? value : null;
}

function sumMetrics(rows: GoogleSearchConsoleMetricRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.clicks += row.clicks;
      acc.impressions += row.impressions;
      acc.weightedPosition += row.position * row.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0, weightedPosition: 0 },
  );
}

function getCtr(clicks: number, impressions: number) {
  if (impressions <= 0) {
    return null;
  }

  return Math.round((clicks / impressions) * 1000) / 10;
}

function getAveragePosition(rows: GoogleSearchConsoleMetricRow[]) {
  const summary = sumMetrics(rows);

  if (summary.impressions <= 0) {
    return null;
  }

  return Math.round((summary.weightedPosition / summary.impressions) * 100) / 100;
}

function getLastUpdatedAt(rows: GoogleSearchConsoleMetricRow[]) {
  return rows.reduce<string | null>((latest, row) => {
    if (!row.updatedAt) {
      return latest;
    }

    if (!latest) {
      return row.updatedAt;
    }

    return new Date(row.updatedAt).getTime() > new Date(latest).getTime() ? row.updatedAt : latest;
  }, null);
}

function formatLastSyncLabel(connection: GoogleSearchConsoleConnection | null, lastUpdatedAt: string | null) {
  if (connection?.lastSyncStatus === 'error') {
    return 'La última actualización necesitó revisión.';
  }

  if (lastUpdatedAt) {
    return `Actualizado por última vez el ${new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(lastUpdatedAt))}.`;
  }

  return 'Todavía no hay datos sincronizados para mostrar.';
}

export async function getGoogleSearchConsoleOverview(
  projectId: string,
  connection: GoogleSearchConsoleConnection | null,
): Promise<GoogleSearchConsoleOverview> {
  const dateRange = getDateRange(28);
  const previousRange = getPreviousDateRange(dateRange.from, 28);
  const [currentRows, previousRows] = await Promise.all([
    getGoogleSearchConsoleMetricsByRange(projectId, dateRange.from, dateRange.to),
    getGoogleSearchConsoleMetricsByRange(projectId, previousRange.from, previousRange.to),
  ]);

  const currentSummary = sumMetrics(currentRows);
  const previousSummary = sumMetrics(previousRows);
  const currentCtr = getCtr(currentSummary.clicks, currentSummary.impressions);
  const previousCtr = getCtr(previousSummary.clicks, previousSummary.impressions);
  const currentPosition = getAveragePosition(currentRows);
  const previousPosition = getAveragePosition(previousRows);
  const lastUpdatedAt = getLastUpdatedAt(currentRows);

  return {
    clicks: currentSummary.clicks,
    clicksDelta: calcDelta(currentSummary.clicks, previousSummary.clicks),
    ctr: currentCtr,
    ctrDelta: currentCtr !== null && previousCtr !== null ? calcDelta(currentCtr, previousCtr) : null,
    dateRange,
    hasData: currentRows.some((row) => row.clicks > 0 || row.impressions > 0),
    impressions: currentSummary.impressions,
    impressionsDelta: calcDelta(currentSummary.impressions, previousSummary.impressions),
    lastSyncError: connection?.lastSyncError ?? null,
    lastSyncLabel: formatLastSyncLabel(connection, lastUpdatedAt),
    lastUpdatedAt,
    position: currentPosition,
    positionDelta:
      currentPosition !== null && previousPosition !== null ? Math.round((previousPosition - currentPosition) * 100) / 100 : null,
  };
}
