import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingProject,
  AdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

export type AdminProjectAlertSeverity = 'high' | 'medium';
export type AdminProjectAlertTargetType = 'phase' | 'task';

export interface AdminProjectAlertItem {
  id: string;
  severity: AdminProjectAlertSeverity;
  targetType: AdminProjectAlertTargetType;
  title: string;
  description: string;
  ctaLabel: string;
  to: string;
}

function normalizeText(value?: string): string {
  return value?.trim().toLowerCase() ?? '';
}

function isDoneStatus(status?: string): boolean {
  const normalized = normalizeText(status);
  return ['done', 'completed', 'terminada', 'terminado', 'finalizada', 'finalizado'].some((token) =>
    normalized.includes(token),
  );
}

function isBlockedStatus(status?: string): boolean {
  const normalized = normalizeText(status);
  return normalized.includes('blocked') || normalized.includes('bloq');
}

function isOverdue(dateValue?: string): boolean {
  if (!dateValue) {
    return false;
  }

  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  dueDate.setHours(23, 59, 59, 999);
  return dueDate.getTime() < Date.now();
}

function buildPhaseAlerts(projectId: string, phase: AdminProjectTrackingPhase): AdminProjectAlertItem[] {
  const alerts: AdminProjectAlertItem[] = [];

  if (!phase.responsable) {
    alerts.push({
      id: `phase-owner-${phase.key}`,
      severity: 'high',
      targetType: 'phase',
      title: `La fase ${phase.descripcion} no tiene responsable`,
      description: 'Pulse detectó una etapa operativa sin ownership claro. Conviene asignar responsable antes de seguir.',
      ctaLabel: 'Ver fase',
      to: `/admin/proyectos/${projectId}/seguimiento/fases/${phase.key}`,
    });
  }

  const targetDate = phase.fechaEntrega ?? phase.fechaFin;
  if (targetDate && isOverdue(targetDate) && !isDoneStatus(phase.estado)) {
    alerts.push({
      id: `phase-deadline-${phase.key}`,
      severity: 'high',
      targetType: 'phase',
      title: `La fase ${phase.descripcion} quedó vencida`,
      description: 'La fecha objetivo ya pasó y la etapa sigue abierta. Hace falta revisar avance, responsable o plazo.',
      ctaLabel: 'Revisar fase',
      to: `/admin/proyectos/${projectId}/seguimiento/fases/${phase.key}`,
    });
  }

  return alerts;
}

function buildTaskAlerts(projectId: string, task: AdminProjectTrackingTask): AdminProjectAlertItem[] {
  const alerts: AdminProjectAlertItem[] = [];
  const taskPath = `/admin/proyectos/${projectId}/seguimiento/tareas/${task.key}`;
  const taskTitle = task.title || 'Tarea sin título';
  const owner = task.responsable ?? task.assigned_to;

  if (!owner) {
    alerts.push({
      id: `task-owner-${task.key}`,
      severity: 'high',
      targetType: 'task',
      title: `La tarea ${taskTitle} no tiene responsable`,
      description: 'La tarea quedó sin owner visible. Pulse no puede escalar ni seguir esta entrega con claridad.',
      ctaLabel: 'Ver tarea',
      to: taskPath,
    });
  }

  const targetDate = task.fechaLimite ?? task.dueDate;
  if (targetDate && isOverdue(targetDate) && !isDoneStatus(task.status)) {
    alerts.push({
      id: `task-deadline-${task.key}`,
      severity: 'high',
      targetType: 'task',
      title: `La tarea ${taskTitle} está vencida`,
      description: 'La fecha objetivo ya pasó y la tarea sigue abierta. Conviene corregir el estado o replanificar.',
      ctaLabel: 'Revisar tarea',
      to: taskPath,
    });
  }

  if (isBlockedStatus(task.status)) {
    alerts.push({
      id: `task-blocked-${task.key}`,
      severity: 'medium',
      targetType: 'task',
      title: `La tarea ${taskTitle} está bloqueada`,
      description: 'El flujo operativo marca un bloqueo. Conviene revisar dependencia, responsable o próximo paso.',
      ctaLabel: 'Desbloquear tarea',
      to: taskPath,
    });
  }

  return alerts;
}

function getAlertRank(alert: AdminProjectAlertItem): number {
  return alert.severity === 'high' ? 0 : 1;
}

export function getAdminProjectAlerts(project: AdminProjectTrackingProject): AdminProjectAlertItem[] {
  const taskAlerts = [...project.rootTasks, ...project.phases.flatMap((phase) => phase.tareas)].flatMap((task) =>
    buildTaskAlerts(project.id, task),
  );
  const phaseAlerts = project.phases.flatMap((phase) => buildPhaseAlerts(project.id, phase));

  return [...phaseAlerts, ...taskAlerts].sort((left, right) => getAlertRank(left) - getAlertRank(right));
}
