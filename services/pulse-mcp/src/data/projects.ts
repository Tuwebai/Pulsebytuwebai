import { supabase } from './client.js';
import { normalizeDomain, normalizeIdentifier, looksLikeUuid } from './identifiers.js';
import { fetchProjectMetricSummary } from './metrics.js';
import type { ProjectRow } from './types.js';

const PROJECT_SELECT = 'id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by';

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
