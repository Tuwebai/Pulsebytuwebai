import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  refreshAdminProjectTracking,
  saveAdminProjectTrackingPhaseAction,
  saveAdminProjectTrackingTaskAction,
} from '@/features/admin/projects-tracking/hooks/adminProjectTracking.actions';
import {
  adminProjectTrackingQueryKey,
  useAdminProjectTrackingMutations,
} from '@/features/admin/projects-tracking/hooks/useAdminProjectTrackingMutations';
import { getAdminProjectTracking } from '@/features/admin/projects-tracking/services/adminProjectTracking.service';
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

export function useAdminProjectTracking(
  projectId: string | undefined,
  _refreshSignal = 0,
): UseAdminProjectTrackingResult {
  void _refreshSignal;

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

  const { savePhaseMutation, saveTaskMutation } = useAdminProjectTrackingMutations(projectId, queryKey);

  const refresh = useCallback(async () => {
    await refreshAdminProjectTracking(projectQuery.refetch);
  }, [projectQuery]);

  const savePhase = useCallback(
    async (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) =>
      saveAdminProjectTrackingPhaseAction({
        currentPhaseKey,
        input,
        mutateAsync: savePhaseMutation.mutateAsync,
        project: projectQuery.data ?? null,
      }),
    [projectQuery.data, savePhaseMutation],
  );

  const saveTask = useCallback(
    async (input: AdminProjectTrackingTaskInput, currentTaskKey?: string) =>
      saveAdminProjectTrackingTaskAction({
        currentTaskKey,
        input,
        mutateAsync: saveTaskMutation.mutateAsync,
        project: projectQuery.data ?? null,
      }),
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
