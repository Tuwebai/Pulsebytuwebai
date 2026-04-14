import { fetchMetricsByRange } from '@/api/pulse.api';
import type { ChartDataPoint, Period, PulseMetricRow, PulseMetricsTotals } from '@/data/types/pulse';
import { aggregateMetrics, getDateRange, getDaysInRange, getPrevDateRange, getTopPages } from './pulseMetrics.utils';

export function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
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

  const [currentRows, previousRows] = await Promise.all([
    fetchMetricsByRange(projectId, dateRange.from, dateRange.to),
    fetchMetricsByRange(projectId, prevDateRange.from, prevDateRange.to),
  ]);

  const current = aggregateMetrics(currentRows);
  const previous = aggregateMetrics(previousRows);
  const currentDailyAverage = Math.round((current.visits / Math.max(getDaysInRange(period), 1)) * 10) / 10;
  const previousDailyAverage = Math.round((previous.visits / Math.max(getDaysInRange(prevDateRange), 1)) * 10) / 10;
  const currentConsultationRate = calcConsultationRate(current.visits, current.contacts);
  const previousConsultationRate = calcConsultationRate(previous.visits, previous.contacts);

  return {
    visits: current.visits,
    contacts: current.contacts,
    visitsDelta: calcDelta(current.visits, previous.visits),
    contactsDelta: calcDelta(current.contacts, previous.contacts),
    consultationRate: currentConsultationRate,
    consultationRateDelta: calcDelta(currentConsultationRate ?? 0, previousConsultationRate ?? 0),
    dailyAverageVisits: currentDailyAverage,
    dailyAverageVisitsDelta: calcDelta(currentDailyAverage, previousDailyAverage),
    avgSessionSec: current.avgSessionSec,
    topPages: getTopPages(currentRows),
    chartData: formatChartData(currentRows, previousRows),
    period,
    dateRange,
    hasData: currentRows.length > 0,
    lastUpdatedAt: getLastUpdatedAt(currentRows),
  };
}
