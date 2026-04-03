import { ArrowLeft, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';

interface AdminProjectCriticalTaskDetailHeroProps {
  backLabel: string;
  item: AdminProjectCriticalTaskItem;
  onBackToTasks: () => void;
  onEditTask: () => void;
}

export function AdminProjectCriticalTaskDetailHero({
  backLabel,
  item,
  onBackToTasks,
  onEditTask,
}: AdminProjectCriticalTaskDetailHeroProps) {
  const { reason, task } = item;

  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToTasks}
            className="mb-2 h-auto px-0 text-[var(--text-secondary)] hover:bg-transparent hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {task.phaseLabel ?? 'Tarea crítica'}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{task.title}</h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {task.description ?? 'Esta tarea quedó marcada como prioritaria por Pulse para seguimiento operativo.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <span className="rounded-full border border-[var(--danger)]/20 bg-[var(--danger-dim)] px-4 py-2 text-sm font-medium text-[var(--danger)]">
            {reason}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={onEditTask}
            className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
          >
            <SquarePen className="mr-2 h-4 w-4" />
            Editar tarea
          </Button>
        </div>
      </div>
    </section>
  );
}
