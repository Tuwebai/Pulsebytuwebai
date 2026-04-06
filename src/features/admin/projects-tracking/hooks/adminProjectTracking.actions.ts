import { toast } from '@/core/notifications/hooks/useToast';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface RefetchResult {
  error: unknown;
}

export async function refreshAdminProjectTracking(refetch: () => Promise<RefetchResult>) {
  const result = await refetch();

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
}

export async function saveAdminProjectTrackingPhaseAction({
  currentPhaseKey,
  input,
  mutateAsync,
  project,
}: {
  currentPhaseKey?: string;
  input: AdminProjectTrackingPhaseInput;
  mutateAsync: (params: {
    currentPhaseKey?: string;
    currentProject: AdminProjectTrackingProject;
    input: AdminProjectTrackingPhaseInput;
  }) => Promise<unknown>;
  project: AdminProjectTrackingProject | null;
}) {
  if (!project) {
    toast({
      title: 'Error',
      description: 'No pudimos guardar la fase porque el proyecto todavía no está cargado.',
      variant: 'destructive',
    });
    return false;
  }

  try {
    await mutateAsync({ currentPhaseKey, currentProject: project, input });
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
}

export async function saveAdminProjectTrackingTaskAction({
  currentTaskKey,
  input,
  mutateAsync,
  project,
}: {
  currentTaskKey?: string;
  input: AdminProjectTrackingTaskInput;
  mutateAsync: (params: {
    currentProject: AdminProjectTrackingProject;
    currentTaskKey?: string;
    input: AdminProjectTrackingTaskInput;
  }) => Promise<unknown>;
  project: AdminProjectTrackingProject | null;
}) {
  if (!project) {
    toast({
      title: 'Error',
      description: 'No pudimos guardar la tarea porque el proyecto todavía no está cargado.',
      variant: 'destructive',
    });
    return false;
  }

  try {
    await mutateAsync({ currentProject: project, currentTaskKey, input });
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
}
