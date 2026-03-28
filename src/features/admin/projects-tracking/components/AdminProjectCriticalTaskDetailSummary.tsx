import { AlertTriangle, CalendarClock, KanbanSquare, UserRound } from 'lucide-react';

import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';

interface AdminProjectCriticalTaskDetailSummaryProps {
  item: AdminProjectCriticalTaskItem;
}

export function AdminProjectCriticalTaskDetailSummary({ item }: AdminProjectCriticalTaskDetailSummaryProps) {
  const { task, reason } = item;

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <AlertTriangle className="mb-3 h-5 w-5 text-rose-300" />
        <p className="text-sm text-[var(--text-secondary)]">Desvío detectado</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{reason}</p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <UserRound className="mb-3 h-5 w-5 text-sky-300" />
        <p className="text-sm text-[var(--text-secondary)]">Responsable</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          {task.responsable ?? task.assigned_to ?? 'Sin responsable'}
        </p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CalendarClock className="mb-3 h-5 w-5 text-amber-300" />
        <p className="text-sm text-[var(--text-secondary)]">Fecha objetivo</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          {task.fechaLimite ?? task.dueDate ?? 'Sin fecha'}
        </p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <KanbanSquare className="mb-3 h-5 w-5 text-emerald-300" />
        <p className="text-sm text-[var(--text-secondary)]">Estado actual</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{task.status}</p>
      </div>
    </section>
  );
}
