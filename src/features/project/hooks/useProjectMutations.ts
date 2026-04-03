import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import type { Project, User } from '@/contexts/appContext.types';
import { projectService } from '@/features/project/services';

import {
  type AppProjectInput,
  toCreateProjectPayload,
  toUpdateProjectPayload,
} from '@/features/project/hooks/appProjects.payloads';

interface UseProjectMutationsParams {
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  user: User | null;
  invalidateProjectsCache: () => void;
}

export function useProjectMutations({
  setError,
  setLoading,
  setProjects,
  user,
  invalidateProjectsCache,
}: UseProjectMutationsParams) {
  const createProject = useCallback(
    async (projectData: AppProjectInput) => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!user.id.trim()) {
          throw new Error('ID de usuario inválido. No se puede crear el proyecto.');
        }

        const createdProject = await projectService.createProject(
          toCreateProjectPayload(projectData, user.id),
        );

        setProjects((previous) => [...previous, createdProject]);
        invalidateProjectsCache();
      } catch {
        setError('Error al crear el proyecto');
      } finally {
        setLoading(false);
      }
    },
    [invalidateProjectsCache, setError, setLoading, setProjects, user],
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      try {
        setLoading(true);
        setError(null);
        await projectService.updateProject(id, toUpdateProjectPayload(updates));
        invalidateProjectsCache();
      } catch {
        setError('Error al actualizar el proyecto');
      } finally {
        setLoading(false);
      }
    },
    [invalidateProjectsCache, setError, setLoading],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error('ID de usuario inválido. No se puede eliminar el proyecto.');
        }

        await projectService.deleteProject(id, user.id, user.role);
        setProjects((previous) => previous.filter((project) => project.id !== id));
        invalidateProjectsCache();
      } catch (deleteError) {
        setError('Error al eliminar el proyecto');
        throw deleteError;
      } finally {
        setLoading(false);
      }
    },
    [invalidateProjectsCache, setError, setLoading, setProjects, user],
  );

  return {
    createProject,
    deleteProject,
    updateProject,
  };
}
