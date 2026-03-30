import { fetchMetricsByRange } from '@/api/pulse.api';
import type { ChartDataPoint, Period, PulseMetricRow, PulseMetricsTotals, TopPage } from '@/data/types/pulse';

interface DateRange {
  from: string;
  to: string;
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  const next = cloneDate(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getRangeDays(range: DateRange): number {
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1);
}

function getMonthSafeDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

export function getDateRange(period: Period): DateRange {
  const today = cloneDate(new Date());

  if (period === 'last_7_days') {
    return {
      from: formatDate(addDays(today, -6)),
      to: formatDate(today)
    };
  }

  if (period === 'last_30_days') {
    return {
      from: formatDate(addDays(today, -29)),
      to: formatDate(today)
    };
  }

  if (period === 'last_month') {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return {
      from: formatDate(from),
      to: formatDate(to)
    };
  }

  if (period === 'this_year') {
    return {
      from: formatDate(new Date(today.getFullYear(), 0, 1)),
      to: formatDate(today)
    };
  }

  return {
    from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: formatDate(today)
  };
}

export function getPrevDateRange(period: Period): DateRange {
  const today = cloneDate(new Date());
  const currentRange = getDateRange(period);
  const currentDays = getRangeDays(currentRange);

  if (period === 'this_month') {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = getMonthSafeDate(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return {
      from: formatDate(from),
      to: formatDate(to)
    };
  }

  if (period === 'last_month') {
    const from = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const to = new Date(today.getFullYear(), today.getMonth() - 1, 0);
    return {
      from: formatDate(from),
      to: formatDate(to)
    };
  }

  if (period === 'this_year') {
    const previousYear = today.getFullYear() - 1;
    return {
      from: formatDate(new Date(previousYear, 0, 1)),
      to: formatDate(getMonthSafeDate(previousYear, today.getMonth(), today.getDate()))
    };
  }

  const currentFrom = new Date(`${currentRange.from}T00:00:00`);
  const previousTo = addDays(currentFrom, -1);
  const previousFrom = addDays(previousTo, -(currentDays - 1));
  return {
    from: formatDate(previousFrom),
    to: formatDate(previousTo)
  };
}

export function aggregateMetrics(rows: PulseMetricRow[]): { visits: number; contacts: number; avgSessionSec: number } {
  const visits = rows.reduce((total, row) => total + row.visits, 0);
  const contacts = rows.reduce((total, row) => total + row.contacts, 0);
  const avgSessionSec =
    rows.length > 0 ? Math.round(rows.reduce((total, row) => total + row.avg_session_sec, 0) / rows.length) : 0;

  return { visits, contacts, avgSessionSec };
}

export function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }

  const value = Math.round(((current - previous) / previous) * 1000) / 10;
  return Number.isFinite(value) ? value : null;
}

export function calcConsultationRate(visits: number, contacts: number): number | null {
  if (visits <= 0 || contacts <= 0) {
    return null;
  }

  return Math.round((contacts / visits) * 1000) / 10;
}

export function getTopPages(rows: PulseMetricRow[]): TopPage[] {
  const pages = new Map<string, number>();

  rows.forEach((row) => {
    if (row.top_pages.length > 0) {
      row.top_pages.forEach((page) => {
        pages.set(page.path, (pages.get(page.path) || 0) + page.visits);
      });
      return;
    }

    if (!row.top_page) {
      return;
    }

    pages.set(row.top_page, (pages.get(row.top_page) || 0) + row.top_page_visits);
  });

  const totalPageViews = Array.from(pages.values()).reduce((total, visits) => total + visits, 0);

  return Array.from(pages.entries())
    .map(([path, visits]) => ({
      path,
      visits,
      percentage: totalPageViews > 0 ? Math.round((visits / totalPageViews) * 1000) / 10 : 0
    }))
    .sort((left, right) => right.visits - left.visits)
    .slice(0, 5);
}

export function formatChartData(rows: PulseMetricRow[]): ChartDataPoint[] {
  return rows.map((row) => ({
    date: new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(`${row.date}T00:00:00`)),
    visits: row.visits,
    contacts: row.contacts
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

export function getDaysInRange(period: Period): number {
  return getRangeDays(getDateRange(period));
}

export async function getPulseMetrics(projectId: string, period: Period): Promise<PulseMetricsTotals> {
  const dateRange = getDateRange(period);
  const prevDateRange = getPrevDateRange(period);

  const [currentRows, previousRows] = await Promise.all([
    fetchMetricsByRange(projectId, dateRange.from, dateRange.to),
    fetchMetricsByRange(projectId, prevDateRange.from, prevDateRange.to)
  ]);

  const current = aggregateMetrics(currentRows);
  const previous = aggregateMetrics(previousRows);

  return {
    visits: current.visits,
    contacts: current.contacts,
    visitsDelta: calcDelta(current.visits, previous.visits),
    contactsDelta: calcDelta(current.contacts, previous.contacts),
    consultationRate: calcConsultationRate(current.visits, current.contacts),
    avgSessionSec: current.avgSessionSec,
    topPages: getTopPages(currentRows),
    chartData: formatChartData(currentRows),
    period,
    dateRange,
    hasData: currentRows.length > 0,
    lastUpdatedAt: getLastUpdatedAt(currentRows),
  };
}
