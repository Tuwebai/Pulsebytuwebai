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

  const users = (usersResult.data ?? []) as UserRow[];
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
  const linkedProjects = (linkedProjectsResult.data ?? []) as ProjectRow[];

  for (const row of [...(projectsByNameResult.data ?? []), ...(projectsByDomainResult.data ?? [])] as ProjectRow[]) {
    projectMap.set(row.id, row);
  }
  for (const row of linkedProjects) {
    projectMap.set(row.id, row);
  }

  const primaryProjectByUserId = new Map<string, ProjectRow>();
  for (const project of linkedProjects) {
    if (!project.created_by || primaryProjectByUserId.has(project.created_by)) continue;
    primaryProjectByUserId.set(project.created_by, project);
  }

  return {
    query: normalizedQuery,
    users: users.map((user) => ({
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
  });

  return {
    status,
    clients: status === 'todos' ? clients : clients.filter((client) => client.operational_status === status),
  };
}
