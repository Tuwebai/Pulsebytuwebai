import { CalendarDays, Gauge, Layers2, Wrench } from 'lucide-react';

import type { Project } from '@/types/project.types';

import {
  formatOperationalDate,
  getProjectProgress,
} from '@/features/admin/projects/components/adminProjectCard.utils';

interface AdminProjectCardMetricsProps {
  project: Project;
}

export function AdminProjectCardMetrics({ project }: AdminProjectCardMetricsProps) {
  const progress = Math.max(0, Math.min(100, getProjectProgress(project)));
  const technologies = project.technologies?.length ?? 0;
  const tasks = project.tareas?.length ?? 0;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>Avance operativo</span>
          <span className="font-data text-[var(--text-primary)]">{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          <div
            className="h-full rounded-full bg-signal transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Wrench className="h-3.5 w-3.5" />
            Tecnologías
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{technologies} activas</dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Layers2 className="h-3.5 w-3.5" />
            Tareas
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{tasks} registradas</dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <CalendarDays className="h-3.5 w-3.5" />
            Última actualización
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">
            {formatOperationalDate(project.updated_at)}
          </dd>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
          <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <Gauge className="h-3.5 w-3.5" />
            Prioridad
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">
            {project.priority ? project.priority.toUpperCase() : 'Normal'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
