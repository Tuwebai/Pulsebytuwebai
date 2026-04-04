import { supabase } from './client.js';
import { normalizeDomain, normalizeIdentifier, looksLikeUuid } from './identifiers.js';
import { fetchProjectMetricSummary } from './metrics.js';
import type { ProjectRow, UserRow } from './types.js';

const PROJECT_SELECT = 'id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by';
const PROJECT_LIST_SELECT = 'id, name, status, domain, ga4_property_id, completion_percentage, created_at, updated_at, created_by';

async function fetchProjectClients(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserRow>();
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone')
    .in('id', userIds);

  if (error) throw error;

  return new Map(
    ((data ?? []) as UserRow[]).map((user) => [user.id, user]),
  );
}

export async function resolveProjectIdentifier(projectIdentifier: string) {
  const identifier = normalizeIdentifier(projectIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de proyecto valido.');
  }

  if (looksLikeUuid(identifier)) {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('id', identifier)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProjectRow;
  }

  const normalizedDomain = normalizeDomain(identifier);
  const { data: domainMatch, error: domainError } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .ilike('domain', normalizedDomain)
    .limit(5);

  if (domainError) throw domainError;
  const domainProjects = (domainMatch ?? []) as ProjectRow[];
  if (domainProjects.length === 1) return domainProjects[0];

  const { data: nameMatch, error: nameError } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .ilike('name', `%${identifier}%`)
    .limit(5);

  if (nameError) throw nameError;
  const nameProjects = (nameMatch ?? []) as ProjectRow[];
  if (nameProjects.length === 1) return nameProjects[0];

  const combined = [...domainProjects, ...nameProjects].filter(
    (project, index, list) => list.findIndex((item) => item.id === project.id) === index,
  );

  if (combined.length > 1) {
    const candidates = combined.map((project) => project.name || project.domain || project.id).join(', ');
    throw new Error(`Encontramos varios proyectos para "${identifier}". Probá con dominio exacto o UUID. Coincidencias: ${candidates}.`);
  }

  throw new Error(`No encontramos un proyecto en Pulse para "${identifier}".`);
}

export async function fetchLatestProjectForUser(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
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
  const [{ data: project, error }, metricSummary] = await Promise.all([
    supabase.from('projects').select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at').eq('id', projectId).maybeSingle(),
    fetchProjectMetricSummary(projectId),
  ]);

  if (error) throw error;
  if (!project) throw new Error(`No encontramos el proyecto ${projectId}.`);

  return {
    project: project as ProjectRow,
    ...metricSummary,
  };
}

export async function listProjects(filters: {
  userId?: string;
  status?: string;
  completionPercentageLt?: number;
}) {
  let query = supabase
    .from('projects')
    .select(PROJECT_LIST_SELECT)
    .order('updated_at', { ascending: false });

  if (filters.userId) {
    query = query.eq('created_by', filters.userId);
  }

  if (filters.status?.trim()) {
    query = query.eq('status', filters.status.trim());
  }

  if (typeof filters.completionPercentageLt === 'number') {
    query = query.lt('completion_percentage', filters.completionPercentageLt);
  }

  const { data, error } = await query;
  if (error) throw error;

  const projects = (data ?? []) as ProjectRow[];
  const clientsById = await fetchProjectClients(
    projects
      .map((project) => project.created_by)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  return {
    filters: {
      userId: filters.userId ?? null,
      status: filters.status?.trim() || null,
      completion_percentage_lt: typeof filters.completionPercentageLt === 'number' ? filters.completionPercentageLt : null,
    },
    projects: projects.map((project) => {
      const client = project.created_by ? clientsById.get(project.created_by) ?? null : null;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        domain: project.domain,
        ga4_property_id: project.ga4_property_id ?? null,
        completion_percentage: project.completion_percentage ?? null,
        created_at: project.created_at ?? null,
        updated_at: project.updated_at ?? null,
        created_by: project.created_by ?? null,
        client: client
          ? {
              id: client.id,
              email: client.email,
              full_name: client.full_name,
              phone: client.phone,
            }
          : null,
      };
    }),
  };
}
