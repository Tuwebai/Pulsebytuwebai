import { getGoogleSearchConsoleDimensionsByRange, getGoogleSearchConsoleMetricsByRange } from '@/api/googleSearchConsole.api';
import type {
  GoogleSearchConsoleChartPoint,
  GoogleSearchConsoleConnection,
  GoogleSearchConsoleDimensionRow,
  GoogleSearchConsoleMetricRow,
  GoogleSearchConsoleOverview,
  GoogleSearchConsolePeriod,
} from '@/data/types/google';

const GOOGLE_SEARCH_CONSOLE_DATA_LAG_DAYS = 2;

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(days: number) {
  const to = new Date();
  to.setUTCDate(to.getUTCDate() - GOOGLE_SEARCH_CONSOLE_DATA_LAG_DAYS);
  to.setUTCHours(0, 0, 0, 0);

  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
}

export function getGooglePeriodDays(period: GoogleSearchConsolePeriod) {
  if (period === 'last_24_hours') {
    return 1;
  }

  if (period === 'last_7_days') {
    return 7;
  }

  if (period === 'last_3_months') {
    return 90;
  }

  return 28;
}

export function getGooglePeriodLabel(period: GoogleSearchConsolePeriod) {
  if (period === 'last_24_hours') {
    return '24 horas';
  }

  if (period === 'last_7_days') {
    return '7 días';
  }

  if (period === 'last_3_months') {
    return '3 meses';
  }

  return '28 días';
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

function formatChartData(rows: GoogleSearchConsoleMetricRow[]): GoogleSearchConsoleChartPoint[] {
  return rows.map((row) => ({
    ctr: row.impressions > 0 ? Math.round((row.clicks / row.impressions) * 1000) / 10 : null,
    clicks: row.clicks,
    date: new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(`${row.date}T00:00:00`)),
    impressions: row.impressions,
    position: row.impressions > 0 ? Math.round(row.position * 100) / 100 : null,
  }));
}

function sortDimensions(rows: GoogleSearchConsoleDimensionRow[], type: 'page' | 'query') {
  return rows
    .filter((row) => row.dimensionType === type)
    .sort((left, right) => {
      if (right.clicks !== left.clicks) {
        return right.clicks - left.clicks;
      }

      return right.impressions - left.impressions;
    });
}

function formatLastSyncLabel(
  connection: GoogleSearchConsoleConnection | null,
  lastUpdatedAt: string | null,
  period: GoogleSearchConsolePeriod,
) {
  if (connection?.lastSyncStatus === 'error') {
    return 'La última actualización necesitó revisión.';
  }

  if (lastUpdatedAt) {
    return `Actualizado por última vez el ${new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(lastUpdatedAt))} para ${getGooglePeriodLabel(period)}.`;
  }

  return 'Todavía no hay datos sincronizados para mostrar.';
}

export async function getGoogleSearchConsoleOverview(
  projectId: string,
  connection: GoogleSearchConsoleConnection | null,
  period: GoogleSearchConsolePeriod,
): Promise<GoogleSearchConsoleOverview> {
  const days = getGooglePeriodDays(period);
  const dateRange = getDateRange(days);
  const previousRange = getPreviousDateRange(dateRange.from, days);
  const [currentRows, previousRows, dimensionRows] = await Promise.all([
    getGoogleSearchConsoleMetricsByRange(projectId, dateRange.from, dateRange.to),
    getGoogleSearchConsoleMetricsByRange(projectId, previousRange.from, previousRange.to),
    getGoogleSearchConsoleDimensionsByRange(projectId, dateRange.from, dateRange.to),
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
    chartData: formatChartData(currentRows),
    lastSyncError: connection?.lastSyncError ?? null,
    lastSyncLabel: formatLastSyncLabel(connection, lastUpdatedAt, period),
    lastUpdatedAt,
    period,
    position: currentPosition,
    positionDelta:
      currentPosition !== null && previousPosition !== null ? Math.round((previousPosition - currentPosition) * 100) / 100 : null,
    topDays: [...currentRows].sort((left, right) => {
      if (right.clicks !== left.clicks) {
        return right.clicks - left.clicks;
      }

      return right.impressions - left.impressions;
    }),
    topPages: sortDimensions(dimensionRows, 'page'),
    topQueries: sortDimensions(dimensionRows, 'query'),
  };
}
