import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/hooks/use-toast';

import {
  getAdminProjectTracking,
  saveAdminProjectTrackingPhase,
  saveAdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/services/adminProjectTracking.service';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface UseAdminProjectTrackingResult {
  loading: boolean;
  savingPhase: boolean;
  savingTask: boolean;
  error: string | null;
  project: AdminProjectTrackingProject | null;
  refresh: () => Promise<void>;
  savePhase: (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => Promise<boolean>;
  saveTask: (input: AdminProjectTrackingTaskInput, currentTaskKey?: string) => Promise<boolean>;
}

const adminProjectTrackingQueryKey = (projectId: string | undefined) =>
  ['admin-project-tracking', projectId] as const;

export function useAdminProjectTracking(
  projectId: string | undefined,
  _refreshSignal = 0,
): UseAdminProjectTrackingResult {
  void _refreshSignal;

  const queryClient = useQueryClient();
  const queryKey = adminProjectTrackingQueryKey(projectId);

  const projectQuery = useQuery<AdminProjectTrackingProject>({
    queryKey,
    enabled: Boolean(projectId),
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Proyecto no encontrado.');
      }

      return getAdminProjectTracking(projectId);
    },
  });

  const savePhaseMutation = useMutation({
    mutationFn: async ({
      currentPhaseKey,
      currentProject,
      input,
    }: {
      currentPhaseKey?: string;
      currentProject: AdminProjectTrackingProject;
      input: AdminProjectTrackingPhaseInput;
    }) => saveAdminProjectTrackingPhase(currentProject, input, currentPhaseKey),
    onSuccess: (nextProject) => {
      queryClient.setQueryData(queryKey, nextProject);
    },
  });

  const saveTaskMutation = useMutation({
    mutationFn: async ({
      currentProject,
      currentTaskKey,
      input,
    }: {
      currentProject: AdminProjectTrackingProject;
      currentTaskKey?: string;
      input: AdminProjectTrackingTaskInput;
    }) => saveAdminProjectTrackingTask(currentProject, input, currentTaskKey),
    onSuccess: (nextProject) => {
      queryClient.setQueryData(queryKey, nextProject);
    },
  });

  const refresh = useCallback(async () => {
    const result = await projectQuery.refetch();

    if (result.error) {
      toast({
        title: 'Error',
        description: 'No pudimos actualizar el seguimiento operativo.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Actualizado',
      description: 'Seguimiento operativo actualizado correctamente.',
    });
  }, [projectQuery]);

  const savePhase = useCallback(
    async (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => {
      const project = projectQuery.data ?? null;

      if (!project) {
        toast({
          title: 'Error',
          description: 'No pudimos guardar la fase porque el proyecto todavía no está cargado.',
          variant: 'destructive',
        });
        return false;
      }

      try {
        await savePhaseMutation.mutateAsync({
          currentPhaseKey,
          currentProject: project,
          input,
        });
        toast({
          title: currentPhaseKey ? 'Fase actualizada' : 'Fase creada',
          description: currentPhaseKey
            ? 'La fase quedó actualizada en el seguimiento operativo.'
            : 'La fase quedó cargada en el seguimiento operativo.',
        });
        return true;
      } catch (saveError) {
        console.error('Error guardando fase operativa:', saveError);
        toast({
          title: 'Error',
          description: 'No pudimos guardar la fase en la base operativa.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [projectQuery.data, savePhaseMutation],
  );

  const saveTask = useCallback(
    async (input: AdminProjectTrackingTaskInput, currentTaskKey?: string) => {
      const project = projectQuery.data ?? null;

      if (!project) {
        toast({
          title: 'Error',
          description: 'No pudimos guardar la tarea porque el proyecto todavía no está cargado.',
          variant: 'destructive',
        });
        return false;
      }

      try {
        await saveTaskMutation.mutateAsync({
          currentProject: project,
          currentTaskKey,
          input,
        });
        toast({
          title: currentTaskKey ? 'Tarea actualizada' : 'Tarea creada',
          description: currentTaskKey
            ? 'La tarea quedó actualizada en el seguimiento operativo.'
            : 'La tarea quedó cargada en el seguimiento operativo.',
        });
        return true;
      } catch (saveError) {
        console.error('Error guardando tarea operativa:', saveError);
        toast({
          title: 'Error',
          description: 'No pudimos guardar la tarea en la base operativa.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [projectQuery.data, saveTaskMutation],
  );

  return {
    loading: projectQuery.isLoading,
    savingPhase: savePhaseMutation.isPending,
    savingTask: saveTaskMutation.isPending,
    error: projectQuery.isError
      ? projectId
        ? 'No pudimos cargar el seguimiento operativo del proyecto.'
        : 'Proyecto no encontrado.'
      : null,
    project: projectQuery.data ?? null,
    refresh,
    savePhase,
    saveTask,
  };
}
