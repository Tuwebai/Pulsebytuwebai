import type { Project } from '@/contexts/appContext.types';
import type { CreateProjectData, UpdateProjectData } from '@/types/project.types';

export type AppProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;

export function toCreateProjectPayload(
  projectData: AppProjectInput,
  userId: string,
): CreateProjectData & { created_by: string } {
  return {
    name: projectData.name,
    description: projectData.description,
    technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
    environment_variables: projectData.environment_variables,
    status: 'development',
    github_repository_url: projectData.github_repository_url,
    customicon: projectData.customicon,
    screenshot_url: undefined,
    funcionalidades: Array.isArray(projectData.funcionalidades)
      ? projectData.funcionalidades.filter((item): item is string => typeof item === 'string')
      : undefined,
    fases: Array.isArray(projectData.fases) ? projectData.fases : undefined,
    tareas: Array.isArray(projectData.tareas) ? projectData.tareas : undefined,
    type: projectData.type,
    priority: projectData.priority,
    start_date: projectData.start_date,
    end_date: projectData.end_date,
    created_by: userId,
  };
}

export function toUpdateProjectPayload(updates: Partial<Project>): UpdateProjectData {
  return {
    name: updates.name,
    description: updates.description,
    technologies: Array.isArray(updates.technologies) ? updates.technologies : undefined,
    environment_variables: updates.environment_variables,
    status: updates.status,
    github_repository_url: updates.github_repository_url,
    customicon: updates.customicon,
    screenshot_url: undefined,
    funcionalidades: Array.isArray(updates.funcionalidades)
      ? updates.funcionalidades.filter((item): item is string => typeof item === 'string')
      : undefined,
    fases: Array.isArray(updates.fases) ? updates.fases : undefined,
    tareas: Array.isArray(updates.tareas) ? updates.tareas : undefined,
    type: updates.type,
    priority: updates.priority,
    start_date: updates.start_date,
    end_date: updates.end_date,
    is_active: updates.is_active,
    progress: typeof updates.progress === 'number' ? updates.progress : undefined,
    completion_percentage:
      typeof updates.completion_percentage === 'number' ? updates.completion_percentage : undefined,
  };
}
