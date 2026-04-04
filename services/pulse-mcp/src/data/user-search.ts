import { canReadProject, canReadUser, hasProjectAllowlist, hasUserAllowlist } from '../auth.js';
import { supabase } from './client.js';
import { normalizeDomain, normalizeIdentifier } from './identifiers.js';
import type { ProjectRow, UserRow } from './types.js';

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

async function fetchVisibleProjectsByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProjectRow>();
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
    .in('created_by', userIds)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const projects = ((data ?? []) as ProjectRow[]).filter((project) => (
    canReadProject(project.id) && canReadUser(project.created_by)
  ));
  const primaryProjectByUserId = new Map<string, ProjectRow>();

  for (const project of projects) {
    if (!project.created_by || primaryProjectByUserId.has(project.created_by)) {
      continue;
    }

    primaryProjectByUserId.set(project.created_by, project);
  }

  return primaryProjectByUserId;
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

  const users = ((usersResult.data ?? []) as UserRow[]).filter((user) => canReadUser(user.id));
  const matchedUserIds = users.map((user) => user.id);
  const linkedProjectsResult = matchedUserIds.length === 0
    ? { data: [], error: null }
    : await supabase
        .from('projects')
        .select('id, name, domain, status, created_by, updated_at')
        .in('created_by', matchedUserIds)
        .order('updated_at', { ascending: false })
        .limit(20);

  if (linkedProjectsResult.error) throw linkedProjectsResult.error;

  const projectMap = new Map<string, ProjectRow>();
  const linkedProjects = ((linkedProjectsResult.data ?? []) as ProjectRow[]).filter((project) => (
    canReadProject(project.id) && canReadUser(project.created_by)
  ));

  for (const row of [...(projectsByNameResult.data ?? []), ...(projectsByDomainResult.data ?? [])] as ProjectRow[]) {
    if (canReadProject(row.id) && canReadUser(row.created_by)) {
      projectMap.set(row.id, row);
    }
  }
  for (const row of linkedProjects) {
    projectMap.set(row.id, row);
  }

  const primaryProjectByUserId = new Map<string, ProjectRow>();
  for (const project of linkedProjects) {
    if (!project.created_by || primaryProjectByUserId.has(project.created_by)) continue;
    primaryProjectByUserId.set(project.created_by, project);
  }

  const visibleUsers = users.filter((user) => {
    if (primaryProjectByUserId.has(user.id)) {
      return true;
    }

    if (hasProjectAllowlist() && !hasUserAllowlist()) {
      return false;
    }

    return true;
  });

  return {
    query: normalizedQuery,
    users: visibleUsers.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role ?? null,
      primary_project: primaryProjectByUserId.has(user.id)
        ? {
            id: primaryProjectByUserId.get(user.id)?.id ?? '',
            name: primaryProjectByUserId.get(user.id)?.name ?? null,
            domain: primaryProjectByUserId.get(user.id)?.domain ?? null,
            status: primaryProjectByUserId.get(user.id)?.status ?? null,
          }
        : null,
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
    .select(USER_DETAIL_SELECT)
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rawClients = ((data ?? []) as unknown as UserRow[]).filter((client) => canReadUser(client.id));
  const primaryProjectByUserId = await fetchVisibleProjectsByUserIds(rawClients.map((client) => client.id));

  const clients = rawClients
    .map((client) => {
    const project = primaryProjectByUserId.get(client.id) ?? null;
    const accessStatus = client.pulse_access_status ?? (client.onboarding_completed ? 'active' : 'pending');
    const operationalStatus = !project ? 'sin_proyecto' : accessStatus === 'active' || accessStatus === 'invited' ? 'activo' : 'sin_onboarding';

    return {
      id: client.id,
      email: client.email,
      full_name: client.full_name,
      phone: client.phone,
      onboarding_completed: client.onboarding_completed ?? false,
      pulse_access_status: accessStatus,
      project: project ? { id: project.id, name: project.name, status: project.status, domain: project.domain, ga4_property_id: project.ga4_property_id ?? null } : null,
      operational_status: operationalStatus,
      created_at: client.created_at ?? null,
    };
  })
    .filter((client) => {
      if (client.project) {
        return true;
      }

      if (hasProjectAllowlist() && !hasUserAllowlist()) {
        return false;
      }

      return true;
    });

  return {
    status,
    clients: status === 'todos' ? clients : clients.filter((client) => client.operational_status === status),
  };
}
