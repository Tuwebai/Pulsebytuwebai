import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import {
  isAdminProjectTrackingDoneStatus,
  isAdminProjectTrackingOverdue,
} from '@/features/admin/projects-tracking/components/adminProjectTrackingResolution.utils';
import type { AdminProjectTrackingPhase } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface GetAdminProjectPhaseResolutionActionsParams {
  phase: AdminProjectTrackingPhase;
  saving: boolean;
  onOpenEdit: () => void;
  onUpdateStatus: (status: string) => void;
}

export function getAdminProjectPhaseResolutionActions({
  phase,
  saving,
  onOpenEdit,
  onUpdateStatus,
}: GetAdminProjectPhaseResolutionActionsParams): AdminProjectTrackingResolutionAction[] {
  const targetDate = phase.fechaEntrega ?? phase.fechaFin;
  const normalizedStatus = phase.estado.trim().toLowerCase();
  const isBlocked = normalizedStatus.includes('blocked') || normalizedStatus.includes('bloq');

  const draft: Array<AdminProjectTrackingResolutionAction | null> = [
    !phase.responsable
      ? {
          id: 'phase-owner',
          title: 'Asignar responsable',
          description: 'Esta fase sigue sin owner visible. Definirlo ahora evita más desvíos de seguimiento.',
          ctaLabel: 'Asignar owner',
          icon: 'owner',
          disabled: saving,
          onClick: onOpenEdit,
        }
      : null,
    !targetDate
      ? {
          id: 'phase-date-missing',
          title: 'Definir fecha objetivo',
          description: 'Pulse necesita una fecha visible para medir desvío y priorizar esta etapa correctamente.',
          ctaLabel: 'Definir fecha',
          icon: 'date',
          disabled: saving,
          onClick: onOpenEdit,
        }
      : isAdminProjectTrackingOverdue(targetDate) && !isAdminProjectTrackingDoneStatus(phase.estado)
        ? {
            id: 'phase-date-overdue',
            title: 'Actualizar fecha objetivo',
            description: 'La fecha actual ya venció y la fase sigue abierta. Conviene replanificar o cerrar la etapa.',
            ctaLabel: 'Actualizar fecha',
            icon: 'date',
            disabled: saving,
            onClick: onOpenEdit,
          }
        : null,
    !isBlocked && !isAdminProjectTrackingDoneStatus(phase.estado)
      ? {
          id: 'phase-blocked',
          title: 'Marcar bloqueo',
          description: 'Si esta etapa quedó frenada, registrarlo ahora ayuda a que Pulse la priorice como desvío real.',
          ctaLabel: 'Marcar bloqueada',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('Bloqueada'),
        }
      : null,
    phase.estado !== 'En Progreso'
      ? {
          id: 'phase-progress',
          title: 'Mover a en progreso',
          description: 'Si la etapa ya está activa, marcala en progreso para reflejar el estado operativo real.',
          ctaLabel: 'Marcar en progreso',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('En Progreso'),
        }
      : null,
    !isAdminProjectTrackingDoneStatus(phase.estado)
      ? {
          id: 'phase-done',
          title: 'Cerrar fase',
          description: 'Si esta etapa ya quedó resuelta, podés marcarla terminada y sacar el desvío del radar.',
          ctaLabel: 'Marcar terminada',
          icon: 'status',
          disabled: saving,
          onClick: () => onUpdateStatus('Terminada'),
        }
      : null,
  ];

  return draft.filter((action): action is AdminProjectTrackingResolutionAction => action !== null);
}
