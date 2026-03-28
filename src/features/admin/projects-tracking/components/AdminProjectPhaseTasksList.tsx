import { CalendarClock, CircleAlert, SquarePen, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectTrackingQuickActions } from '@/features/admin/projects-tracking/components/AdminProjectTrackingQuickActions';
import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseTasksListProps {
  tasks: AdminProjectTrackingTask[];
  onEditTask: (task: AdminProjectTrackingTask) => void;
  getQuickActions?: (task: AdminProjectTrackingTask) => AdminProjectTrackingResolutionAction[];
}

export function AdminProjectPhaseTasksList({
  tasks,
  onEditTask,
  getQuickActions,
}: AdminProjectPhaseTasksListProps) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-surface)]/70 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Todavía no hay tareas en esta fase</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Usá el botón superior para cargar la primera tarea operativa y empezar a seguir responsables, fechas
            objetivo y bloqueos desde Pulse.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {tasks.map((task) => (
        <article
          key={task.key}
          className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{task.title}</h3>
                {task.description ? (
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full border border-amber-400/20 bg-amber-500/12 px-3 py-1 text-xs font-medium text-amber-300">
                  {task.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <UserRound className="mb-2 h-4 w-4 text-sky-300" />
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Responsable</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {task.responsable ?? task.assigned_to ?? 'Sin responsable'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <CalendarClock className="mb-2 h-4 w-4 text-amber-300" />
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Fecha objetivo</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {task.fechaLimite ?? task.dueDate ?? 'Sin fecha'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <CircleAlert className="mb-2 h-4 w-4 text-rose-300" />
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Prioridad</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{task.priority ?? 'Normal'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <AdminProjectTrackingQuickActions actions={getQuickActions?.(task) ?? []} />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEditTask(task)}
                  className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <SquarePen className="mr-2 h-4 w-4" />
                  Editar tarea
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
