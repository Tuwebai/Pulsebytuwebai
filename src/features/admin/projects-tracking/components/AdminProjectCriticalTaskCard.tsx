import { AlertTriangle, ArrowRight, CalendarClock, KanbanSquare, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { AdminProjectTrackingQuickActions } from '@/features/admin/projects-tracking/components/AdminProjectTrackingQuickActions';
import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';

interface AdminProjectCriticalTaskCardProps {
  item: AdminProjectCriticalTaskItem;
  projectId: string;
  quickActions?: AdminProjectTrackingResolutionAction[];
}

export function AdminProjectCriticalTaskCard({
  item,
  projectId,
  quickActions = [],
}: AdminProjectCriticalTaskCardProps) {
  const { task, reason } = item;

  return (
    <article className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              {task.phaseLabel ?? 'Tarea operativa'}
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{task.title}</h2>
            {task.description ? (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
            ) : null}
          </div>
          <span className="rounded-full border border-rose-400/20 bg-rose-500/12 px-3 py-1 text-xs font-medium text-rose-300">
            {reason}
          </span>
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
            <KanbanSquare className="mb-2 h-4 w-4 text-emerald-300" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Estado</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{task.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <span>Esta tarea entra en seguimiento prioritario hasta resolver su desvío.</span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <AdminProjectTrackingQuickActions actions={quickActions} />

          <div className="flex justify-end">
            <Link
              to={`/admin/proyectos/${projectId}/seguimiento/tareas/${encodeURIComponent(task.key)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-white/15 hover:bg-white/[0.06]"
            >
              Ver tarea
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
