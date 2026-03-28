import { AdminProjectCriticalTaskCard } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskCard';
import { AdminProjectCriticalTasksEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksEmptyState';
import { getAdminProjectCriticalTaskResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskResolution.utils';
import type {
  AdminProjectCriticalTaskFilter,
  AdminProjectCriticalTaskItem,
} from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectCriticalTasksResultsProps {
  activeFilter: AdminProjectCriticalTaskFilter;
  items: AdminProjectCriticalTaskItem[];
  projectId: string;
  savingTask: boolean;
  visibleItems: AdminProjectCriticalTaskItem[];
  onOpenEditTask: (task: AdminProjectTrackingTask) => void;
  onUpdateTask: (task: AdminProjectTrackingTask, patch: { status?: string; priority?: string }) => void;
}

export function AdminProjectCriticalTasksResults({
  activeFilter,
  items,
  projectId,
  savingTask,
  visibleItems,
  onOpenEditTask,
  onUpdateTask,
}: AdminProjectCriticalTasksResultsProps) {
  if (items.length === 0) {
    return <AdminProjectCriticalTasksEmptyState />;
  }

  if (visibleItems.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-surface)]/70 p-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">No hay tareas en este filtro</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse no detecta tareas {activeFilter === 'blocked' ? 'bloqueadas' : activeFilter === 'overdue' ? 'vencidas' : 'sin responsable'} en este momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {visibleItems.map((item) => (
        <AdminProjectCriticalTaskCard
          key={item.task.key}
          item={item}
          projectId={projectId}
          quickActions={getAdminProjectCriticalTaskResolutionActions({
            task: item.task,
            saving: savingTask,
            onOpenEdit: () => onOpenEditTask(item.task),
            onUpdateStatus: (status) => onUpdateTask(item.task, { status }),
            onUpdatePriority: (priority) => onUpdateTask(item.task, { priority }),
          }).slice(0, 2)}
        />
      ))}
    </section>
  );
}
