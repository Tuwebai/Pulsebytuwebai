import { fetchMetricsByRange } from '@/api/pulse.api';
import type { ChartDataPoint, Period, PulseMetricRow, PulseMetricsTotals } from '@/data/types/pulse';
import { aggregateMetrics, getDateRange, getDaysInRange, getPrevDateRange, getTopPages } from './pulseMetrics.utils';

export function calcDelta(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  const value = Math.round(((current - previous) / previous) * 1000) / 10;
  return Number.isFinite(value) ? value : null;
}

export function calcConsultationRate(visits: number, contacts: number): number | null {
  if (visits <= 0) {
    return 0;
  }

  return Math.round((contacts / visits) * 1000) / 10;
}

export function formatChartData(rows: PulseMetricRow[], previousRows: PulseMetricRow[] = []): ChartDataPoint[] {
  return rows.map((row, index) => ({
    date: new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(`${row.date}T00:00:00`)),
    previousContacts: previousRows[index]?.contacts ?? null,
    previousVisits: previousRows[index]?.visits ?? null,
    visits: row.visits,
    contacts: row.contacts,
  }));
}

function getLastUpdatedAt(rows: PulseMetricRow[]): string | null {
  return rows.reduce<string | null>((latest, row) => {
    if (!row.updated_at) {
      return latest;
    }

    if (!latest) {
      return row.updated_at;
    }

    return new Date(row.updated_at).getTime() > new Date(latest).getTime() ? row.updated_at : latest;
  }, null);
}

export { getDaysInRange };

export async function getPulseMetrics(projectId: string, period: Period): Promise<PulseMetricsTotals> {
  const dateRange = getDateRange(period);
  const prevDateRange = getPrevDateRange(period);
  const previousPeriodDays =
    Math.max(1, Math.round((new Date(`${prevDateRange.to}T00:00:00`).getTime() - new Date(`${prevDateRange.from}T00:00:00`).getTime()) / (24 * 60 * 60 * 1000)) + 1);

  const [currentRows, previousRows] = await Promise.all([
    fetchMetricsByRange(projectId, dateRange.from, dateRange.to),
    fetchMetricsByRange(projectId, prevDateRange.from, prevDateRange.to),
  ]);

  const current = aggregateMetrics(currentRows);
  const previous = aggregateMetrics(previousRows);
  const currentDailyAverageRaw = current.visits / Math.max(getDaysInRange(period), 1);
  const previousDailyAverageRaw = previous.visits / previousPeriodDays;
  const currentConsultationRateRaw = current.visits > 0 ? (current.contacts / current.visits) * 100 : 0;
  const previousConsultationRateRaw = previous.visits > 0 ? (previous.contacts / previous.visits) * 100 : 0;
  const currentDailyAverage = Math.round(currentDailyAverageRaw * 10) / 10;
  const currentConsultationRate = Math.round(currentConsultationRateRaw * 10) / 10;

  return {
    visits: current.visits,
    contacts: current.contacts,
    visitsDelta: calcDelta(current.visits, previous.visits),
    contactsDelta: calcDelta(current.contacts, previous.contacts),
    consultationRate: currentConsultationRate,
    consultationRateDelta: calcDelta(currentConsultationRateRaw, previousConsultationRateRaw),
    dailyAverageVisits: currentDailyAverage,
    dailyAverageVisitsDelta: calcDelta(currentDailyAverageRaw, previousDailyAverageRaw),
    avgSessionSec: current.avgSessionSec,
    topPages: getTopPages(currentRows),
    chartData: formatChartData(currentRows, previousRows),
    period,
    dateRange,
    hasData: currentRows.length > 0,
    lastUpdatedAt: getLastUpdatedAt(currentRows),
  };
}
