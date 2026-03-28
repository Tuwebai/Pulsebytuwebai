import { getAdminProjectCriticalTaskResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskResolution.utils';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

export function getAdminProjectPhaseStatusInput(
  phase: AdminProjectTrackingPhase,
  nextStatus: string,
) {
  return {
    descripcion: phase.descripcion ?? phase.key,
    estado: nextStatus,
    responsable: phase.responsable ?? '',
    fechaEntrega: phase.fechaEntrega ?? phase.fechaFin ?? '',
  };
}

export function getAdminProjectPhaseTaskInput(
  task: AdminProjectTrackingTask,
  phaseKey: string,
  overrides: { priority?: string; status?: string },
) {
  return {
    title: task.title,
    description: task.description ?? '',
    status: overrides.status ?? task.status,
    priority: overrides.priority ?? task.priority ?? 'alta',
    responsable: task.responsable ?? task.assigned_to ?? '',
    fechaLimite: task.fechaLimite ?? task.dueDate ?? '',
    phaseKey,
  };
}

export function getAdminProjectPhaseTaskQuickActions({
  task,
  saving,
  onOpenEdit,
  onSaveTask,
}: {
  task: AdminProjectTrackingTask;
  saving: boolean;
  onOpenEdit: () => void;
  onSaveTask: (overrides: { priority?: string; status?: string }) => Promise<void>;
}) {
  return getAdminProjectCriticalTaskResolutionActions({
    task,
    saving,
    onOpenEdit,
    onUpdateStatus: (status) => void onSaveTask({ status }),
    onUpdatePriority: (priority) => void onSaveTask({ priority }),
  }).slice(0, 2);
}
