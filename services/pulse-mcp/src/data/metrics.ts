import { type PulsePeriod, getDateRange, getPreviousDateRange } from '../date-ranges.js';
import { supabase } from './client.js';
import type { PulseMetricRow } from './types.js';

function sum(rows: PulseMetricRow[], field: 'visits' | 'contacts' | 'avg_session_sec') {
  return rows.reduce((total, row) => total + (row[field] ?? 0), 0);
}

function calcDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function buildTopPages(rows: PulseMetricRow[], limit: number) {
  const aggregate = new Map<string, { label: string | null; path: string; visits: number }>();

  for (const row of rows) {
    for (const page of row.top_pages ?? []) {
      if (!page.path) continue;
      const current = aggregate.get(page.path) ?? { label: page.label ?? null, path: page.path, visits: 0 };
      current.visits += page.visits ?? 0;
      aggregate.set(page.path, current);
    }

    if (row.top_page) {
      const current = aggregate.get(row.top_page) ?? { label: null, path: row.top_page, visits: 0 };
      current.visits += row.top_page_visits ?? 0;
      aggregate.set(row.top_page, current);
    }
  }

  const totalVisits = [...aggregate.values()].reduce((total, page) => total + page.visits, 0);

  return [...aggregate.values()]
    .sort((left, right) => right.visits - left.visits)
    .slice(0, limit)
    .map((page) => ({
      ...page,
      percentage: totalVisits > 0 ? Number(((page.visits / totalVisits) * 100).toFixed(1)) : 0,
    }));
}

export async function fetchMetricRows(projectId: string, from: string, to: string) {
  const { data, error } = await supabase
    .from('pulse_metrics')
    .select('metric_date, visits, contacts, avg_session_sec, top_page, top_page_visits, top_pages, updated_at')
    .eq('project_id', projectId)
    .gte('metric_date', from)
    .lte('metric_date', to)
    .order('metric_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PulseMetricRow[];
}

export async function fetchPulseMetrics(projectId: string, period: PulsePeriod) {
  const currentRange = getDateRange(period);
  const previousRange = getPreviousDateRange(period);
  const [currentRows, previousRows] = await Promise.all([
    fetchMetricRows(projectId, currentRange.from, currentRange.to),
    fetchMetricRows(projectId, previousRange.from, previousRange.to),
  ]);

  const visits = sum(currentRows, 'visits');
  const contacts = sum(currentRows, 'contacts');
  const avgSessionSec = currentRows.length > 0 ? Number((sum(currentRows, 'avg_session_sec') / currentRows.length).toFixed(1)) : 0;

  return {
    period,
    dateRange: currentRange,
    totals: {
      visits,
      contacts,
      avgSessionSec,
      consultationRate: visits > 0 ? Number(((contacts / visits) * 100).toFixed(2)) : null,
    },
    comparison: {
      visitsDelta: calcDelta(visits, sum(previousRows, 'visits')),
      contactsDelta: calcDelta(contacts, sum(previousRows, 'contacts')),
    },
    series: currentRows.map((row) => ({
      date: row.metric_date,
      visits: row.visits ?? 0,
      contacts: row.contacts ?? 0,
    })),
    topPages: buildTopPages(currentRows, 10),
    hasData: currentRows.length > 0,
    lastUpdatedAt: currentRows.at(-1)?.updated_at ?? null,
  };
}

export async function fetchProjectMetricSummary(projectId: string) {
  const recentRange = getDateRange('last_30_days');
  const recentRows = await fetchMetricRows(projectId, recentRange.from, recentRange.to);
  const latestMetric = recentRows.at(-1) ?? null;

  return {
    latestMetric: latestMetric
      ? {
          date: latestMetric.metric_date,
          visits: latestMetric.visits ?? 0,
          contacts: latestMetric.contacts ?? 0,
        }
      : null,
    recentTotals: {
      visits: sum(recentRows, 'visits'),
      contacts: sum(recentRows, 'contacts'),
      topPages: buildTopPages(recentRows, 5),
    },
  };
}
