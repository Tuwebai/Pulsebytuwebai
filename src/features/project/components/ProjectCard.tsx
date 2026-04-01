import { CalendarDays, ChevronRight, PenSquare, Trash2 } from 'lucide-react';

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
  onViewProject?: (project: ProjectsPageProject) => void;
  onNavigateToEdit?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export default function ProjectCard({
  project,
  projectCreator,
  showAdminActions = false,
  onViewProject,
  onNavigateToEdit,
  onDeleteProject,
}: ProjectCardProps) {
  const progress = getProjectProgress(project);
  const clientPendingTasks = getProjectClientPendingTasks(project).length;
  const stateLabel = getProjectStateLabel(project);
  const stateVariant = getProjectStateVariant(project);
  const totalPhases = project.fases?.length ?? 0;

  return (
    <article className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-[border-color] duration-150 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            {project.type ?? 'Proyecto web'}
          </p>
          <h2 className="mt-2 truncate text-[18px] font-medium text-[var(--text-primary)]">{project.name}</h2>
        </div>

        <Badge dot size="md" variant={stateVariant}>
          {stateLabel}
        </Badge>
      </div>

      <p className="mt-4 min-h-[40px] text-sm leading-6 text-[var(--text-secondary)]">
        {project.description?.trim() || 'Tu equipo de TuWebAI sigue trabajando en este proyecto.'}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          <span>Progreso</span>
          <span className="font-data text-[var(--text-primary)]">{progress}%</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-[var(--bg-subtle)]">
          <div className="h-1 rounded-full bg-[var(--signal)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ProjectCardSummaryItem label="Progreso" value={`${progress}%`} />
        <ProjectCardSummaryItem label="Fases" value={totalPhases} />
        <ProjectCardSummaryItem label="Tu parte" value={clientPendingTasks > 0 ? clientPendingTasks : 'Al día'} />
      </div>

      <div className="mt-5 space-y-2 text-[13px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
          <span>Última actualización: {formatDateSafe(project.updated_at)}</span>
        </div>
        {showAdminActions && projectCreator ? (
          <p className="truncate text-[13px] text-[var(--text-secondary)]">
            Cliente: {projectCreator.full_name || projectCreator.email}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button className="h-10 rounded-[10px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]" onClick={() => onViewProject?.(project)} type="button">
          Ver detalles
        </Button>

        {stateVariant !== 'success' ? (
          <Button
            className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            onClick={() => onViewProject?.(project)}
            type="button"
            variant="outline"
          >
            Continuar
            <ChevronRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
          </Button>
        ) : null}

        {showAdminActions ? (
          <>
            <Button
              className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-3 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={() => onNavigateToEdit?.(project.id)}
              type="button"
              variant="outline"
            >
              <PenSquare className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              className="h-10 rounded-[10px] border border-[var(--danger-dim)] bg-transparent px-3 text-[var(--danger)] hover:bg-[var(--danger-dim)]"
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
