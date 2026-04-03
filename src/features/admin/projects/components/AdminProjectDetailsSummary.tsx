import { CalendarDays, Flag, GitBranch, Layers3, Wrench } from 'lucide-react';

import type { Project } from '@/types/project.types';

import { formatOperationalDate, getProjectProgress } from '@/features/admin/projects/components/adminProjectCard.utils';

interface AdminProjectDetailsSummaryProps {
  project: Project;
}

export function AdminProjectDetailsSummary({ project }: AdminProjectDetailsSummaryProps) {
  const progress = Math.max(0, Math.min(100, getProjectProgress(project)));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>Avance operativo</span>
          <span className="font-data text-[var(--text-primary)]">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          <div className="h-full rounded-full bg-signal transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Wrench className="h-3.5 w-3.5" />
            Tecnologías
          </dt>
          <dd className="mt-1.5 text-sm text-[var(--text-primary)]">
            {project.technologies.length > 0 ? project.technologies.join(', ') : 'Sin stack operativo cargado'}
          </dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Layers3 className="h-3.5 w-3.5" />
            Base de trabajo
          </dt>
          <dd className="mt-1.5 text-sm text-[var(--text-primary)]">
            {project.tareas?.length ?? 0} tareas, {project.fases?.length ?? 0} fases
          </dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Flag className="h-3.5 w-3.5" />
            Prioridad
          </dt>
          <dd className="mt-1.5 text-sm text-[var(--text-primary)]">
            {project.priority ? project.priority.toUpperCase() : 'Normal'}
          </dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <GitBranch className="h-3.5 w-3.5" />
            Repositorio
          </dt>
          <dd className="mt-1.5 break-all text-sm text-[var(--text-primary)]">
            {project.github_repository_url || 'Sin referencia técnica vinculada'}
          </dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <CalendarDays className="h-3.5 w-3.5" />
            Inicio
          </dt>
          <dd className="mt-1.5 text-sm text-[var(--text-primary)]">{formatOperationalDate(project.start_date || project.created_at)}</dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <CalendarDays className="h-3.5 w-3.5" />
            Último movimiento
          </dt>
          <dd className="mt-1.5 text-sm text-[var(--text-primary)]">{formatOperationalDate(project.updated_at)}</dd>
        </div>
      </dl>
    </div>
  );
}
