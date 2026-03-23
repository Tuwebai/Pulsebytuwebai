import { pulseMetricsApi, type PulseMetricRecord } from '@/api/pulse/pulseMetricsApi';

export type PulsePeriod = 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'this_year';

interface DateRange {
  start: Date;
  end: Date;
}

interface TopPageAggregate {
  path: string;
  visits: number;
}

export interface PulseOverviewPage {
  path: string;
  visits: number;
  percent: number;
}

export interface PulseOverviewHighlight {
  label: string;
  timestamp: string;
}

export interface PulseOverviewPoint {
  date: string;
  label: string;
  visits: number;
  contacts: number;
}

export interface PulseOverviewData {
  period: PulsePeriod;
  periodLabel: string;
  visits: number;
  contacts: number;
  visitsDelta?: number;
  contactsDelta?: number;
  topPage: string | null;
  topPageVisits: number;
  averageTime: string | null;
  pages: PulseOverviewPage[];
  series: PulseOverviewPoint[];
  recentHighlights: PulseOverviewHighlight[];
  hasMetrics: boolean;
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date);
}

function formatPeriodLabel(period: PulsePeriod, now: Date): string {
  if (period === 'last_7_days') {
    return 'ultimos 7 dias';
  }

  if (period === 'last_30_days') {
    return 'ultimos 30 dias';
  }

  if (period === 'this_year') {
    return new Intl.DateTimeFormat('es-AR', { year: 'numeric' }).format(now);
  }

  const targetDate = period === 'last_month' ? new Date(now.getFullYear(), now.getMonth() - 1, 1) : now;
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(targetDate);
}

function getCurrentRange(period: PulsePeriod, now = new Date()): DateRange {
  const today = cloneDate(now);

  if (period === 'last_7_days') {
    return { start: addDays(today, -6), end: today };
  }

  if (period === 'last_30_days') {
    return { start: addDays(today, -29), end: today };
  }

  if (period === 'last_month') {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    };
  }

  if (period === 'this_year') {
    return { start: new Date(today.getFullYear(), 0, 1), end: today };
  }

  return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today
  };
}

function getPreviousRange(current: DateRange): DateRange {
  const dayMs = 24 * 60 * 60 * 1000;
  const dayCount = Math.max(1, Math.round((current.end.getTime() - current.start.getTime()) / dayMs) + 1);
  const previousEnd = addDays(current.start, -1);
  const previousStart = addDays(previousEnd, -(dayCount - 1));
  return { start: previousStart, end: previousEnd };
}

function safePercentDelta(currentValue: number, previousValue: number): number | undefined {
  if (previousValue <= 0) {
    return currentValue > 0 ? 100 : undefined;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

function formatDuration(seconds: number): string | null {
  if (!seconds || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${`${remainingSeconds}`.padStart(2, '0')}`;
}

function parseTopPages(value: unknown): TopPageAggregate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const path = typeof record.path === 'string' ? record.path : typeof record.page === 'string' ? record.page : null;
      const visits = typeof record.visits === 'number' ? record.visits : typeof record.value === 'number' ? record.value : null;

      if (!path || visits === null) {
        return null;
      }

      return { path, visits };
    })
    .filter((item): item is TopPageAggregate => Boolean(item));
}

function aggregateTopPages(rows: PulseMetricRecord[]): TopPageAggregate[] {
  const totals = new Map<string, number>();

  rows.forEach((row) => {
    const pages = parseTopPages(row.top_pages);

    if (pages.length > 0) {
      pages.forEach((page) => {
        totals.set(page.path, (totals.get(page.path) || 0) + page.visits);
      });
      return;
    }

    if (row.top_page) {
      totals.set(row.top_page, (totals.get(row.top_page) || 0) + (row.top_page_visits || 0));
    }
  });

  return Array.from(totals.entries())
    .map(([path, visits]) => ({ path, visits }))
    .sort((left, right) => right.visits - left.visits);
}

function buildHighlights(rows: PulseMetricRecord[]): PulseOverviewHighlight[] {
  const latestRows = [...rows]
    .sort((left, right) => right.metric_date.localeCompare(left.metric_date))
    .filter((row) => row.visits > 0 || row.contacts > 0)
    .slice(0, 3);

  return latestRows.map((row) => {
    const today = formatDateKey(new Date());
    const yesterday = formatDateKey(addDays(new Date(), -1));
    const timestamp =
      row.metric_date === today
        ? 'Hoy'
        : row.metric_date === yesterday
          ? 'Ayer'
          : formatShortDateLabel(row.metric_date);

    if (row.contacts > 0) {
      return {
        label: `${row.contacts} consultas desde tu web`,
        timestamp
      };
    }

    return {
      label: `${row.visits} visitas en tu web`,
      timestamp
    };
  });
}

function buildSeries(rows: PulseMetricRecord[]): PulseOverviewPoint[] {
  return rows.map((row) => ({
    date: row.metric_date,
    label: formatShortDateLabel(row.metric_date),
    visits: row.visits || 0,
    contacts: row.contacts || 0
  }));
}

function summarizeRows(rows: PulseMetricRecord[]) {
  const visits = rows.reduce((total, row) => total + (row.visits || 0), 0);
  const contacts = rows.reduce((total, row) => total + (row.contacts || 0), 0);
  const weightedSessionSeconds = rows.reduce((total, row) => total + (row.avg_session_sec || 0) * Math.max(row.visits || 0, 1), 0);
  const weight = rows.reduce((total, row) => total + Math.max(row.visits || 0, 1), 0);
  const averageSeconds = weight > 0 ? Math.round(weightedSessionSeconds / weight) : 0;
  const topPages = aggregateTopPages(rows);
  const totalPageVisits = topPages.reduce((total, page) => total + page.visits, 0);

  return {
    visits,
    contacts,
    averageSeconds,
    pages: topPages.slice(0, 5).map((page) => ({
      path: page.path,
      visits: page.visits,
      percent: totalPageVisits > 0 ? Math.round((page.visits / totalPageVisits) * 100) : 0
    })),
    topPage: topPages[0]?.path || null,
    topPageVisits: topPages[0]?.visits || 0
  };
}

export const pulseMetricsService = {
  async getOverview(projectId: string, period: PulsePeriod): Promise<PulseOverviewData> {
    const currentRange = getCurrentRange(period);
    const previousRange = getPreviousRange(currentRange);
    const currentStart = formatDateKey(currentRange.start);
    const currentEnd = formatDateKey(currentRange.end);
    const previousStart = formatDateKey(previousRange.start);
    const previousEnd = formatDateKey(previousRange.end);

    const allRows = await pulseMetricsApi.getMetricsByProject(projectId, previousStart, currentEnd);
    const currentRows = allRows.filter((row) => row.metric_date >= currentStart && row.metric_date <= currentEnd);
    const previousRows = allRows.filter((row) => row.metric_date >= previousStart && row.metric_date <= previousEnd);

    const currentSummary = summarizeRows(currentRows);
    const previousSummary = summarizeRows(previousRows);

    return {
      period,
      periodLabel: formatPeriodLabel(period, new Date()),
      visits: currentSummary.visits,
      contacts: currentSummary.contacts,
      visitsDelta: safePercentDelta(currentSummary.visits, previousSummary.visits),
      contactsDelta: safePercentDelta(currentSummary.contacts, previousSummary.contacts),
      topPage: currentSummary.topPage,
      topPageVisits: currentSummary.topPageVisits,
      averageTime: formatDuration(currentSummary.averageSeconds),
      pages: currentSummary.pages,
      series: buildSeries(currentRows),
      recentHighlights: buildHighlights(currentRows),
      hasMetrics: currentRows.length > 0
    };
  }
};
