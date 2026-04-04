import { supabase } from './client.js';
import { fetchLatestProjectForUser, resolveProjectIdentifier } from './projects.js';
import { resolveUserIdentifier } from './users.js';

type ProjectMutationInput = {
  projectIdentifier?: string;
  userIdentifier?: string;
};

type ProjectUpdates = {
  name?: string;
  status?: string;
  completion_percentage?: number;
  domain?: string;
  ga4_property_id?: string;
};

type ProjectCreateInput = {
  userIdentifier: string;
  name: string;
  status?: string;
  completion_percentage?: number;
  domain?: string;
  ga4_property_id?: string;
};

async function resolveProjectFromActionInput(input: ProjectMutationInput) {
  if (input.projectIdentifier?.trim()) {
    return resolveProjectIdentifier(input.projectIdentifier);
  }

  if (input.userIdentifier?.trim()) {
    const user = await resolveUserIdentifier(input.userIdentifier);
    return fetchLatestProjectForUser(user.id);
  }

  throw new Error('Necesitamos un projectIdentifier o userIdentifier para ubicar el proyecto.');
}

function buildProjectUpdateMessage(projectName: string | null, status: string) {
  const safeName = projectName?.trim() ? `"${projectName.trim()}"` : 'tu proyecto';
  return `${safeName} ahora figura como ${status}.`;
}

function sanitizeProjectUpdates(input: ProjectUpdates) {
  const updates: ProjectUpdates = {};

  if (typeof input.name === 'string' && input.name.trim()) {
    updates.name = input.name.trim();
  }

  if (typeof input.status === 'string' && input.status.trim()) {
    updates.status = input.status.trim();
  }

  if (typeof input.domain === 'string') {
    updates.domain = input.domain.trim();
  }

  if (typeof input.ga4_property_id === 'string') {
    updates.ga4_property_id = input.ga4_property_id.trim();
  }

  if (typeof input.completion_percentage === 'number' && Number.isFinite(input.completion_percentage)) {
    updates.completion_percentage = Math.max(0, Math.min(100, Math.round(input.completion_percentage)));
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No recibimos cambios permitidos para actualizar el proyecto.');
  }

  return updates;
}

function sanitizeProjectCreateInput(input: ProjectCreateInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Necesitamos el nombre del proyecto para crearlo.');
  }

  const payload: {
    created_by: string;
    name: string;
    status?: string;
    completion_percentage?: number;
    domain?: string;
    ga4_property_id?: string;
  } = {
    created_by: input.userIdentifier,
    name,
  };

  if (typeof input.status === 'string' && input.status.trim()) {
    payload.status = input.status.trim();
  }

  if (typeof input.domain === 'string') {
    payload.domain = input.domain.trim();
  }

  if (typeof input.ga4_property_id === 'string') {
    payload.ga4_property_id = input.ga4_property_id.trim();
  }

  if (typeof input.completion_percentage === 'number' && Number.isFinite(input.completion_percentage)) {
    payload.completion_percentage = Math.max(0, Math.min(100, Math.round(input.completion_percentage)));
  }

  return payload;
}

export async function createProject(input: ProjectCreateInput) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const projectInsert = sanitizeProjectCreateInput({
    userIdentifier: user.id,
    name: input.name,
    status: input.status,
    completion_percentage: input.completion_percentage,
    domain: input.domain,
    ga4_property_id: input.ga4_property_id,
  });

  const { data: createdProject, error } = await supabase
    .from('projects')
    .insert(projectInsert)
    .select('id, name, status, domain, ga4_property_id, completion_percentage, created_at, updated_at, created_by')
    .single();

  if (error) throw error;

  return {
    resolvedUser: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
    },
    project: createdProject,
  };
}

export async function updateProjectDetails(input: ProjectMutationInput & ProjectUpdates) {
  const project = await resolveProjectFromActionInput(input);
  const updates = sanitizeProjectUpdates({
    name: input.name,
    status: input.status,
    completion_percentage: input.completion_percentage,
    domain: input.domain,
    ga4_property_id: input.ga4_property_id,
  });

  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', project.id)
    .select('id, name, status, domain, ga4_property_id, completion_percentage, updated_at, created_by')
    .single();

  if (error) throw error;

  const statusChanged = typeof updates.status === 'string' && updates.status !== project.status;
  if (statusChanged && project.created_by) {
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('users')
      .select('notif_project_update')
      .eq('id', project.created_by)
      .maybeSingle();

    if (userPrefsError) throw userPrefsError;

    if ((userPrefs as { notif_project_update?: boolean | null } | null)?.notif_project_update !== false) {
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: project.created_by,
        type: 'info',
        category: 'project',
        title: 'Actualizamos el estado de tu proyecto',
        message: buildProjectUpdateMessage(updates.name ?? project.name, updates.status ?? ''),
        is_read: false,
        action_url: '/dashboard/proyecto',
        metadata: {
          project_id: project.id,
          previous_status: project.status,
          status: updates.status,
          source: 'pulse_mcp',
        },
      });

      if (notificationError) throw notificationError;
    }
  }

  return {
    projectBefore: project,
    projectAfter: updatedProject,
    updated_fields: Object.keys(updates),
  };
}

export async function assignProjectGa4(input: ProjectMutationInput & { ga4_property_id: string }) {
  const ga4PropertyId = input.ga4_property_id.trim();

  if (!ga4PropertyId) {
    throw new Error('Necesitamos un ga4_property_id valido para vincular la medicion.');
  }

  return updateProjectDetails({
    projectIdentifier: input.projectIdentifier,
    userIdentifier: input.userIdentifier,
    ga4_property_id: ga4PropertyId,
  });
}
