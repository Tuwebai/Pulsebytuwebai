import { useCallback } from 'react';

import type { Project } from '@/contexts/appContext.types';
import { projectService } from '@/features/project/services';

type ProjectPhase = NonNullable<Project['fases']>[number];

interface UseProjectPhaseMutationsParams {
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  invalidateProjectsCache: () => void;
}

export function useProjectPhaseMutations({
  setError,
  setLoading,
  invalidateProjectsCache,
}: UseProjectPhaseMutationsParams) {
  const addFunctionalities = useCallback(
    async (projectId: string, functionalities: string[]) => {
      try {
        setLoading(true);
        setError(null);

        const currentProject = await projectService.getProjectById(projectId);
        const updatedFunctionalities = [...(currentProject.funcionalidades || []), ...functionalities];

        await projectService.updateProject(projectId, { funcionalidades: updatedFunctionalities });
        invalidateProjectsCache();
      } catch {
        setError('Error al agregar funcionalidades');
      } finally {
        setLoading(false);
      }
    },
    [invalidateProjectsCache, setError, setLoading],
  );

  const addCommentToPhase = useCallback(
    async (
      projectId: string,
      faseKey: string,
      comment: {
        texto: string;
        autor: string;
        tipo: 'admin' | 'cliente';
      },
    ) => {
      try {
        setLoading(true);
        setError(null);

        const currentProject = await projectService.getProjectById(projectId);
        const phases: ProjectPhase[] = currentProject.fases || [];
        const updatedPhases = phases.map((phase) => {
          if (phase.key !== faseKey) {
            return phase;
          }

          const comments = phase.comentarios || [];
          return {
            ...phase,
            comentarios: [
              ...comments,
              { id: Date.now().toString(), ...comment, fecha: new Date().toISOString() },
            ],
          };
        });

        await projectService.updateProject(projectId, { fases: updatedPhases });
        invalidateProjectsCache();
      } catch {
        setError('Error al agregar comentario');
      } finally {
        setLoading(false);
      }
    },
    [invalidateProjectsCache, setError, setLoading],
  );

  return {
    addCommentToPhase,
    addFunctionalities,
  };
}
