import { CalendarDays, PenSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/core/components/Badge';
import { formatDateSafe } from '@/utils/formatDateSafe';
import ProjectCardSummaryItem from './ProjectCardSummaryItem';
import type { ProjectsPageProject } from './projectPage.types';
import {
  getProjectClientPendingTasks,
  getProjectProgress,
  getProjectStateLabel,
  getProjectStateVariant,
} from './projectPage.utils';

interface ProjectCardProps {
  project: ProjectsPageProject;
  projectCreator?: { full_name: string; email: string };
  showAdminActions?: boolean;
  onDeleteProject?: (projectId: string) => void;
  onNavigateToEdit?: (projectId: string) => void;
  onViewProject?: (project: ProjectsPageProject) => void;
}

export default function ProjectCard({
  project,
  projectCreator,
  showAdminActions = false,
  onDeleteProject,
  onNavigateToEdit,
  onViewProject,
}: ProjectCardProps) {
  const progress = getProjectProgress(project);
  const clientPendingTasks = getProjectClientPendingTasks(project).length;
  const stateLabel = getProjectStateLabel(project);
  const stateVariant = getProjectStateVariant(project);
  const totalPhases = project.fases?.length ?? 0;

  return (
    <article className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] transition-colors duration-150 hover:border-white/15 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {project.type ?? 'Proyecto web'}
          </p>
          <h2 className="mt-2 truncate text-lg font-medium text-slate-100">{project.name}</h2>
        </div>

        <Badge dot size="sm" variant={stateVariant}>
          {stateLabel}
        </Badge>
      </div>

      <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-400">
        {project.description?.trim() || 'Tu equipo de TuWebAI sigue avanzando con este proyecto.'}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Progreso</span>
          <span className="font-data text-slate-50">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-base)]/80">
          <div className="h-1.5 rounded-full bg-signal transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ProjectCardSummaryItem label="Progreso" value={`${progress}%`} />
        <ProjectCardSummaryItem label="Fases" value={totalPhases} />
        <ProjectCardSummaryItem label="Tu parte" value={clientPendingTasks > 0 ? clientPendingTasks : 'Al día'} />
      </div>

      <div className="mt-5 space-y-2 text-[13px] text-slate-400">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <span>Última actualización: {formatDateSafe(project.updated_at)}</span>
        </div>
        {showAdminActions && projectCreator ? (
          <p className="truncate text-[13px] text-slate-400">Cliente: {projectCreator.full_name || projectCreator.email}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button className="h-10 rounded-full bg-signal px-4 text-white hover:bg-[var(--signal-dim)]" onClick={() => onViewProject?.(project)} type="button">
          Ver detalles
        </Button>

        {showAdminActions ? (
          <>
            <Button
              className="h-10 rounded-full border border-white/10 bg-[var(--bg-base)]/70 px-3 text-slate-200 hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-white"
              onClick={() => onNavigateToEdit?.(project.id)}
              type="button"
              variant="outline"
            >
              <PenSquare className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              className="h-10 rounded-full border border-[var(--danger-dim)] bg-transparent px-3 text-[var(--danger)] hover:bg-[var(--danger-dim)]"
              onClick={() => onDeleteProject?.(project.id)}
              type="button"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
