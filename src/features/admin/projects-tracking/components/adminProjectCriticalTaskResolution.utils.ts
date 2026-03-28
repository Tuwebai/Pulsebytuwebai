import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import {
  isAdminProjectTrackingDoneStatus,
  isAdminProjectTrackingOverdue,
} from '@/features/admin/projects-tracking/components/adminProjectTrackingResolution.utils';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface GetAdminProjectCriticalTaskResolutionActionsParams {
  task: AdminProjectTrackingTask;
  saving: boolean;
  onOpenEdit: () => void;
  onUpdateStatus: (status: string) => void;
  onUpdatePriority: (priority: string) => void;
}

export function getAdminProjectCriticalTaskResolutionActions({
  task,
  saving,
  onOpenEdit,
  onUpdateStatus,
  onUpdatePriority,
}: GetAdminProjectCriticalTaskResolutionActionsParams): AdminProjectTrackingResolutionAction[] {
  const owner = task.responsable ?? task.assigned_to;
  const targetDate = task.fechaLimite ?? task.dueDate;
  const normalizedStatus = task.status.trim().toLowerCase();
  const normalizedPriority = task.priority?.trim().toLowerCase();
  const isBlocked = normalizedStatus.includes('blocked') || normalizedStatus.includes('bloq');
  const isHighPriority =
    normalizedPriority === 'alta' ||
    normalizedPriority === 'high' ||
    normalizedPriority === 'critical' ||
    normalizedPriority === 'critica';

  const draft: Array<AdminProjectTrackingResolutionAction | null> = [
    !owner
      ? {
          id: 'task-owner',
          title: 'Asignar responsable',
          description: 'La tarea está sin owner visible. Resolverlo ahora le devuelve trazabilidad al seguimiento.',
          ctaLabel: 'Asignar owner',
          icon: 'owner',
          disabled: saving,
          onClick: onOpenEdit,
        }
      : null,
    !targetDate
      ? {
          id: 'task-date-missing',
          title: 'Definir fecha objetivo',
          description: 'Sin fecha objetivo Pulse no puede medir riesgo ni vencimiento de esta tarea crítica.',
          ctaLabel: 'Definir fecha',
          icon: 'date',
          disabled: saving,
          onClick: onOpenEdit,
        }
      : isAdminProjectTrackingOverdue(targetDate) && !isAdminProjectTrackingDoneStatus(task.status)
        ? {
            id: 'task-date-overdue',
            title: 'Actualizar fecha objetivo',
            description: 'La fecha actual ya venció y la tarea sigue abierta. Conviene replanificar o cerrar el desvío.',
            ctaLabel: 'Actualizar fecha',
            icon: 'date',
            disabled: saving,
            onClick: onOpenEdit,
          }
        : null,
    !isBlocked && !isAdminProjectTrackingDoneStatus(task.status)
      ? {
          id: 'task-blocked',
          title: 'Marcar bloqueo',
          description: 'Si esta tarea quedó frenada, registrarlo ahora ayuda a que Pulse la priorice como desvío real.',
          ctaLabel: 'Marcar bloqueada',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('Bloqueada'),
        }
      : null,
    !isHighPriority
      ? {
          id: 'task-priority-high',
          title: 'Subir prioridad',
          description: 'Si este punto ya requiere atención inmediata, podés dejarlo en prioridad alta sin abrir el editor completo.',
          ctaLabel: 'Subir prioridad',
          icon: 'priority',
          disabled: saving,
          onClick: () => onUpdatePriority('alta'),
        }
      : null,
    task.status !== 'En Progreso'
      ? {
          id: 'task-progress',
          title: 'Mover a en progreso',
          description: 'Si ya se está trabajando este bloqueo, marcá la tarea en progreso para reflejarlo en Pulse.',
          ctaLabel: 'Marcar en progreso',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('En Progreso'),
        }
      : null,
    !isAdminProjectTrackingDoneStatus(task.status)
      ? {
          id: 'task-done',
          title: 'Cerrar tarea',
          description: 'Si el desvío ya quedó resuelto, podés terminar la tarea y limpiar la prioridad operativa.',
          ctaLabel: 'Marcar terminada',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('Terminada'),
        }
      : null,
  ];

  return draft.filter((action): action is AdminProjectTrackingResolutionAction => action !== null);
}
