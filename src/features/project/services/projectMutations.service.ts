import { supabase } from '@/data/supabase/client';
import { detectProjectType } from '@/utils/projectTypeDetector';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

import { getProjectById } from '@/features/project/services/projectQueries.service';
import { validateProjectData } from '@/features/project/services/projectValidation.service';

type CreateProjectInput = CreateProjectData & { created_by?: string; user_role?: string };

export async function createProject(projectData: CreateProjectInput): Promise<Project> {
  const validation = validateProjectData(projectData);
  if (!validation.isValid) {
    throw new Error(`Datos del proyecto inválidos: ${validation.errors.join(', ')}`);
  }

  if (!projectData.created_by?.trim()) {
    throw new Error('El campo created_by es requerido y debe ser un ID de usuario válido');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', projectData.created_by)
    .single();

  if (userError) {
    throw new Error('No se pudo verificar el rol del usuario');
  }

  const approvalStatus = userData.role === 'admin' ? 'approved' : 'pending';
  const detectedType = detectProjectType({
    name: projectData.name,
    description: projectData.description,
    technologies: projectData.technologies,
  });

  const projectToCreate = {
    name: projectData.name,
    description: projectData.description,
    technologies: projectData.technologies,
    status: projectData.status || 'development',
    is_active: true,
    created_by: projectData.created_by,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approval_status: approvalStatus,
    type: detectedType.name,
    ...(userData.role === 'admin'
      ? {
          approved_by: projectData.created_by,
          approved_at: new Date().toISOString(),
        }
      : {}),
  };

  const { data, error } = await supabase.from('projects').insert([projectToCreate]).select().single();

  if (error?.code === '23505') {
    throw new Error('Ya existe un proyecto con ese nombre');
  }

  if (error?.code === '23503') {
    throw new Error('Usuario no válido para crear el proyecto');
  }

  if (error?.code === '42501') {
    throw new Error('No tenés permisos para crear proyectos');
  }

  if (error) {
    throw new Error(`Error al crear el proyecto: ${error.message}`);
  }

  return data as Project;
}

export async function updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
  await getProjectById(id);

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...projectData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar el proyecto: ${error.message}`);
  }

  return data as Project;
}
