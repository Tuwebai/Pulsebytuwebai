import type { AdminProjectTrackingProject, AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

export interface AdminProjectCriticalTaskItem {
  task: AdminProjectTrackingTask;
  reason: string;
}

function isOverdue(dateValue?: string): boolean {
  if (!dateValue) {
    return false;
  }

  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const now = new Date();
  dueDate.setHours(23, 59, 59, 999);
  return dueDate.getTime() < now.getTime();
}

function getTaskReason(task: AdminProjectTrackingTask): string | null {
  const status = task.status.trim().toLowerCase();
  const priority = task.priority?.trim().toLowerCase();
  const hasOwner = Boolean(task.responsable ?? task.assigned_to);

  if (!hasOwner) {
    return 'Sin responsable asignado';
  }

  if (isOverdue(task.fechaLimite ?? task.dueDate)) {
    return 'Fecha objetivo vencida';
  }

  if (status.includes('blocked') || status.includes('bloq')) {
    return 'Bloqueada';
  }

  if (priority === 'high' || priority === 'alta' || priority === 'critical' || priority === 'critica') {
    return 'Prioridad alta';
  }

  return null;
}

export function getAdminProjectCriticalTasks(project: AdminProjectTrackingProject): AdminProjectCriticalTaskItem[] {
  const allTasks = [...project.rootTasks, ...project.phases.flatMap((phase) => phase.tareas)];

  return allTasks
    .map((task) => {
      const reason = getTaskReason(task);
      return reason ? { task, reason } : null;
    })
    .filter((item): item is AdminProjectCriticalTaskItem => item !== null);
}

export function getAdminProjectCriticalTaskByKey(
  project: AdminProjectTrackingProject,
  taskKey: string,
): AdminProjectCriticalTaskItem | null {
  return getAdminProjectCriticalTasks(project).find((item) => item.task.key === taskKey) ?? null;
}
