import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';

export function getAdminProjectCriticalTaskDetailInput(
  item: AdminProjectCriticalTaskItem,
  overrides: { priority?: string; status?: string },
) {
  const { task } = item;

  return {
    title: task.title,
    description: task.description ?? '',
    status: overrides.status ?? task.status,
    priority: overrides.priority ?? task.priority ?? 'alta',
    responsable: task.responsable ?? task.assigned_to ?? '',
    fechaLimite: task.fechaLimite ?? task.dueDate ?? '',
    phaseKey: task.source.phaseKey,
  };
}
