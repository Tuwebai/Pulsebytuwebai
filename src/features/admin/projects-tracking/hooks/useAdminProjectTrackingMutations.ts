import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  saveAdminProjectTrackingPhase,
  saveAdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/services/adminProjectTracking.service';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

export const adminProjectTrackingQueryKey = (projectId: string | undefined) =>
  ['admin-project-tracking', projectId] as const;

export function useAdminProjectTrackingMutations(
  projectId: string | undefined,
  queryKey: readonly ['admin-project-tracking', string | undefined],
) {
  const queryClient = useQueryClient();

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
    mutationKey: ['admin-project-tracking-phase', projectId],
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
    mutationKey: ['admin-project-tracking-task', projectId],
  });

  return {
    savePhaseMutation,
    saveTaskMutation,
  };
}
