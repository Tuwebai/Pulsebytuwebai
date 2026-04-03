import { type PulsePeriod } from '../date-ranges.js';
import { supabase } from './client.js';
import { looksLikeEmail, looksLikeUuid, normalizeIdentifier, normalizeDomain } from './identifiers.js';
import { fetchPulseMetrics } from './metrics.js';
import { fetchNotifications } from './notifications.js';
import { fetchLatestProjectForUser } from './projects.js';
import { fetchSupportTickets } from './support.js';
import type { ProjectRow, UserRow } from './types.js';

const USER_BASE_SELECT = 'id, email, full_name, phone';
const USER_DETAIL_SELECT = [
  'id',
  'email',
  'full_name',
  'phone',
  'role',
  'website',
  'onboarding_completed',
  'onboarding_completed_at',
  'pulse_access_status',
  'pulse_access_granted_at',
  'pulse_access_disabled_at',
  'created_at',
  'updated_at',
].join(', ');

export async function resolveUserIdentifier(userIdentifier: string) {
  const identifier = normalizeIdentifier(userIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de usuario valido.');
  }

  if (looksLikeUuid(identifier)) {
    const { data, error } = await supabase.from('users').select(USER_BASE_SELECT).eq('id', identifier).maybeSingle();
    if (error) throw error;
    if (data) return data as UserRow;
  }

  if (looksLikeEmail(identifier)) {
    const { data, error } = await supabase.from('users').select(USER_BASE_SELECT).ilike('email', identifier).maybeSingle();
    if (error) throw error;
    if (data) return data as UserRow;
  }

  const domainQuery = normalizeDomain(identifier);
  const [usersResult, websiteResult] = await Promise.all([
    supabase
      .from('users')
      .select(USER_BASE_SELECT)
      .or(`full_name.ilike.%${identifier}%,phone.ilike.%${identifier}%`)
      .limit(5),
    supabase
      .from('users')
      .select(USER_BASE_SELECT)
      .ilike('website', `%${domainQuery}%`)
      .limit(5),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (websiteResult.error) throw websiteResult.error;

  const combined = [...((usersResult.data ?? []) as UserRow[]), ...((websiteResult.data ?? []) as UserRow[])].filter(
    (user, index, list) => list.findIndex((item) => item.id === user.id) === index,
  );

  if (combined.length === 1) return combined[0];
  if (combined.length > 1) {
    const candidates = combined.map((user) => user.full_name || user.email || user.id).join(', ');
    throw new Error(`Encontramos varios usuarios para "${identifier}". Probá con email o UUID. Coincidencias: ${candidates}.`);
  }

  throw new Error(`No encontramos un usuario en Pulse para "${identifier}".`);
}

export async function fetchUserById(userId: string) {
  const { data, error } = await supabase.from('users').select(USER_DETAIL_SELECT).eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No encontramos el usuario ${userId}.`);
  return data as unknown as UserRow;
}

export async function searchEntities(query: string) {
  const normalizedQuery = normalizeIdentifier(query);

  if (!normalizedQuery) {
    throw new Error('Necesitamos un texto para buscar usuarios o proyectos.');
  }

  const domainQuery = normalizeDomain(normalizedQuery);
  const [usersResult, projectsByNameResult, projectsByDomainResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, full_name, phone, role')
      .or(`email.ilike.%${normalizedQuery}%,full_name.ilike.%${normalizedQuery}%,phone.ilike.%${normalizedQuery}%`)
      .limit(8),
    supabase
      .from('projects')
      .select('id, name, domain, status, created_by')
      .or(`name.ilike.%${normalizedQuery}%,status.ilike.%${normalizedQuery}%`)
      .limit(8),
    supabase
      .from('projects')
      .select('id, name, domain, status, created_by')
      .ilike('domain', `%${domainQuery}%`)
      .limit(8),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (projectsByNameResult.error) throw projectsByNameResult.error;
  if (projectsByDomainResult.error) throw projectsByDomainResult.error;

  const projectMap = new Map<string, ProjectRow>();
  for (const row of [...(projectsByNameResult.data ?? []), ...(projectsByDomainResult.data ?? [])] as ProjectRow[]) {
    projectMap.set(row.id, row);
  }

  return {
    query: normalizedQuery,
    users: ((usersResult.data ?? []) as UserRow[]).map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role ?? null,
    })),
    projects: [...projectMap.values()].map((project) => ({
      id: project.id,
      name: project.name,
      domain: project.domain,
      status: project.status,
      created_by: project.created_by ?? null,
    })),
  };
}

export async function listClients(status: 'activo' | 'sin_onboarding' | 'sin_proyecto' | 'todos') {
  const { data, error } = await supabase
    .from('users')
    .select([
      USER_DETAIL_SELECT,
      'projects(id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by)',
    ].join(', '))
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const clients = ((data ?? []) as unknown as Array<UserRow & { projects?: ProjectRow[] | null }>).map((client) => {
    const project = Array.isArray(client.projects) ? client.projects[0] ?? null : null;
    const accessStatus = client.pulse_access_status ?? (client.onboarding_completed ? 'active' : 'pending');
    const operationalStatus = !project
      ? 'sin_proyecto'
      : accessStatus === 'active' || accessStatus === 'invited'
        ? 'activo'
        : 'sin_onboarding';

    return {
      id: client.id,
      email: client.email,
      full_name: client.full_name,
      phone: client.phone,
      onboarding_completed: client.onboarding_completed ?? false,
      pulse_access_status: accessStatus,
      project: project
        ? {
            id: project.id,
            name: project.name,
            status: project.status,
            domain: project.domain,
            ga4_property_id: project.ga4_property_id ?? null,
          }
        : null,
      operational_status: operationalStatus,
      created_at: client.created_at ?? null,
    };
  });

  return {
    status,
    clients: status === 'todos' ? clients : clients.filter((client) => client.operational_status === status),
  };
}

export async function fetchClientOverview(userId: string, metricsPeriod: PulsePeriod = 'last_30_days') {
  const user = await fetchUserById(userId);
  const project = await fetchLatestProjectForUser(userId).catch(() => null);
  const [notifications, tickets, metrics] = await Promise.all([
    fetchNotifications(userId, 5, false),
    fetchSupportTickets(userId, 5),
    project ? fetchPulseMetrics(project.id, metricsPeriod) : Promise.resolve(null),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      website: user.website ?? null,
      onboarding_completed: user.onboarding_completed ?? false,
      onboarding_completed_at: user.onboarding_completed_at ?? null,
      pulse_access_status: user.pulse_access_status ?? null,
      pulse_access_granted_at: user.pulse_access_granted_at ?? null,
      pulse_access_disabled_at: user.pulse_access_disabled_at ?? null,
      created_at: user.created_at ?? null,
      updated_at: user.updated_at ?? null,
    },
    project,
    metrics,
    notifications: {
      unreadCount: notifications.unreadCount,
      latest: notifications.notifications.slice(0, 5),
    },
    support: {
      openTickets: tickets.tickets.filter((ticket) => ticket.estado === 'abierto' || ticket.estado === 'open').length,
      latest: tickets.tickets.slice(0, 5),
    },
  };
}
