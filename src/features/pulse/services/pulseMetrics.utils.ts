import type { Period, PulseMetricRow, TopPage } from '@/data/types/pulse';

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

function normalizePagePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const withoutQuery = trimmed.split('?')[0].split('#')[0];
  const normalized = withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery;
  return normalized || '/';
}

function resolvePulsePageLabel(path: string, label?: string | null): string {
  if (label && label.trim().length > 0) {
    return label.trim();
  }

  return path === '/' ? 'Inicio' : path;
}

export function getDateRange(period: Period): DateRange {
  const today = cloneDate(new Date());

  if (period === 'last_7_days') return { from: formatDate(addDays(today, -6)), to: formatDate(today) };
  if (period === 'last_30_days') return { from: formatDate(addDays(today, -29)), to: formatDate(today) };

  if (period === 'last_month') {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: formatDate(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }

  if (period === 'this_year') {
    return { from: formatDate(new Date(today.getFullYear(), 0, 1)), to: formatDate(today) };
  }

  return { from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: formatDate(today) };
}

export function getPrevDateRange(period: Period): DateRange {
  const today = cloneDate(new Date());
  const currentRange = getDateRange(period);
  const currentDays = getRangeDays(currentRange);

  if (period === 'this_month') {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: formatDate(getMonthSafeDate(today.getFullYear(), today.getMonth() - 1, today.getDate())),
    };
  }

  if (period === 'last_month') {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
      to: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 0)),
    };
  }

  if (period === 'this_year') {
    const previousYear = today.getFullYear() - 1;
    return {
      from: formatDate(new Date(previousYear, 0, 1)),
      to: formatDate(getMonthSafeDate(previousYear, today.getMonth(), today.getDate())),
    };
  }

  const currentFrom = new Date(`${currentRange.from}T00:00:00`);
  const previousTo = addDays(currentFrom, -1);
  const previousFrom = addDays(previousTo, -(currentDays - 1));
  return { from: formatDate(previousFrom), to: formatDate(previousTo) };
}

export function getDaysInRange(period: Period): number {
  return getRangeDays(getDateRange(period));
}

export function aggregateMetrics(rows: PulseMetricRow[]) {
  const visits = rows.reduce((total, row) => total + row.visits, 0);
  const contacts = rows.reduce((total, row) => total + row.contacts, 0);
  const avgSessionSec = rows.length > 0 ? Math.round(rows.reduce((total, row) => total + row.avg_session_sec, 0) / rows.length) : 0;
  return { visits, contacts, avgSessionSec };
}

export function getTopPages(rows: PulseMetricRow[]): TopPage[] {
  const pages = new Map<string, { label: string; path: string; visits: number }>();

  rows.forEach((row) => {
    if (row.top_pages.length > 0) {
      row.top_pages.forEach((page) => {
        const normalizedPath = normalizePagePath(page.path);
        const previous = pages.get(normalizedPath);
        pages.set(normalizedPath, {
          label: resolvePulsePageLabel(normalizedPath, page.label),
          path: normalizedPath,
          visits: (previous?.visits || 0) + page.visits,
        });
      });
      return;
    }

    if (!row.top_page) {
      return;
    }

    const normalizedPath = normalizePagePath(row.top_page);
    const previous = pages.get(normalizedPath);
    pages.set(normalizedPath, {
      label: resolvePulsePageLabel(normalizedPath),
      path: normalizedPath,
      visits: (previous?.visits || 0) + row.top_page_visits,
    });
  });

  const totalPageViews = Array.from(pages.values()).reduce((total, page) => total + page.visits, 0);

  return Array.from(pages.values())
    .map((page) => ({
      label: page.label,
      path: page.path,
      visits: page.visits,
      percentage: totalPageViews > 0 ? Math.round((page.visits / totalPageViews) * 1000) / 10 : 0,
    }))
    .sort((left, right) => right.visits - left.visits)
    .slice(0, 5);
}
