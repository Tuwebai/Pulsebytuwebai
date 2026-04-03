import { createClient } from '@supabase/supabase-js';

import { getDateRange, getPreviousDateRange, type PulsePeriod } from './date-ranges.js';
import { pulseMcpConfig } from './env.js';

interface ProjectRow {
  id: string;
  name: string | null;
  status: string | null;
  domain: string | null;
  ga4_property_id: string | null;
  completion_percentage: number | null;
  updated_at: string | null;
  created_by?: string | null;
}

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
}

interface PulseMetricRow {
  metric_date: string;
  visits: number | null;
  contacts: number | null;
  avg_session_sec: number | null;
  top_page: string | null;
  top_page_visits: number | null;
  top_pages: Array<{ label?: string | null; path?: string | null; visits?: number | null }> | null;
  updated_at: string | null;
}

interface NotificationRow {
  id: string;
  title: string;
  message: string | null;
  category: string | null;
  type: string | null;
  is_read: boolean | null;
  is_urgent: boolean | null;
  created_at: string | null;
}

interface TicketRow {
  id: string;
  asunto: string | null;
  estado: string | null;
  prioridad: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface TicketMessageRow {
  ticket_id: string;
  content: string;
  sender_role: 'client' | 'admin';
  created_at: string;
}

const supabase = createClient(pulseMcpConfig.supabaseUrl, pulseMcpConfig.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeIdentifier(value: string) {
  return value.trim();
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

async function fetchMetricRows(projectId: string, from: string, to: string) {
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

export async function resolveUserIdentifier(userIdentifier: string) {
  const identifier = normalizeIdentifier(userIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de usuario valido.');
  }

  if (looksLikeUuid(identifier)) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone')
      .eq('id', identifier)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as UserRow;
  }

  if (looksLikeEmail(identifier)) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone')
      .ilike('email', identifier)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as UserRow;
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone')
    .or(`full_name.ilike.%${identifier}%,phone.ilike.%${identifier}%`)
    .limit(5);

  if (error) throw error;

  const users = (data ?? []) as UserRow[];

  if (users.length === 1) {
    return users[0];
  }

  if (users.length > 1) {
    const candidates = users
      .map((user) => user.full_name || user.email || user.id)
      .join(', ');

    throw new Error(`Encontramos varios usuarios para "${identifier}". Probá con email o UUID. Coincidencias: ${candidates}.`);
  }

  throw new Error(`No encontramos un usuario en Pulse para "${identifier}".`);
}

export async function resolveProjectIdentifier(projectIdentifier: string) {
  const identifier = normalizeIdentifier(projectIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de proyecto valido.');
  }

  if (looksLikeUuid(identifier)) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
      .eq('id', identifier)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProjectRow;
  }

  const normalizedDomain = normalizeDomain(identifier);
  const { data: domainMatch, error: domainError } = await supabase
    .from('projects')
    .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
    .ilike('domain', normalizedDomain)
    .limit(5);

  if (domainError) throw domainError;

  const domainProjects = (domainMatch ?? []) as ProjectRow[];

  if (domainProjects.length === 1) {
    return domainProjects[0];
  }

  const { data: nameMatch, error: nameError } = await supabase
    .from('projects')
    .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
    .ilike('name', `%${identifier}%`)
    .limit(5);

  if (nameError) throw nameError;

  const nameProjects = (nameMatch ?? []) as ProjectRow[];

  if (nameProjects.length === 1) {
    return nameProjects[0];
  }

  const combined = [...domainProjects, ...nameProjects].filter(
    (project, index, list) => list.findIndex((item) => item.id === project.id) === index,
  );

  if (combined.length > 1) {
    const candidates = combined
      .map((project) => project.name || project.domain || project.id)
      .join(', ');

    throw new Error(`Encontramos varios proyectos para "${identifier}". Probá con dominio exacto o UUID. Coincidencias: ${candidates}.`);
  }

  throw new Error(`No encontramos un proyecto en Pulse para "${identifier}".`);
}

export async function fetchLatestProjectForUser(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
    .eq('created_by', userId)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  const projects = (data ?? []) as ProjectRow[];

  if (projects.length === 0) {
    throw new Error('No encontramos proyectos asociados a ese usuario en Pulse.');
  }

  return projects[0];
}

export async function fetchProjectSummary(projectId: string) {
  const recentRange = getDateRange('last_30_days');
  const [{ data: project, error: projectError }, recentRows] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at')
      .eq('id', projectId)
      .maybeSingle(),
    fetchMetricRows(projectId, recentRange.from, recentRange.to),
  ]);

  if (projectError) throw projectError;
  if (!project) throw new Error(`No encontramos el proyecto ${projectId}.`);

  const latestMetric = recentRows.at(-1) ?? null;

  return {
    project: project as ProjectRow,
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

export async function fetchNotifications(userId: string, limit: number, unreadOnly: boolean) {
  let query = supabase
    .from('notifications')
    .select('id, title, message, category, type, is_read, is_urgent, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    query,
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false),
  ]);

  if (error) throw error;
  if (countError) throw countError;

  return {
    userId,
    unreadCount: count ?? 0,
    notifications: (data ?? []) as NotificationRow[],
  };
}

export async function fetchSupportTickets(userId: string, limit: number) {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, asunto, estado, prioridad, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const ticketIds = ((tickets ?? []) as TicketRow[]).map((ticket) => ticket.id);
  let messages: TicketMessageRow[] = [];

  if (ticketIds.length > 0) {
    const { data: messageRows, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('ticket_id, content, sender_role, created_at')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;
    messages = (messageRows ?? []) as TicketMessageRow[];
  }

  return {
    userId,
    tickets: ((tickets ?? []) as TicketRow[]).map((ticket) => ({
      ...ticket,
      lastMessage: messages.find((message) => message.ticket_id === ticket.id) ?? null,
    })),
  };
}
