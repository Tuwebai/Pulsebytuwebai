import { CalendarDays, ChevronRight, PenSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/core/components/Badge';
import { formatDateSafe } from '@/utils/formatDateSafe';
import type { ProjectsPageProject } from './projectPage.types';
import {
  getProjectProgress,
  getProjectStateLabel,
  getProjectStateVariant,
  getProjectTaskStats
} from './projectPage.utils';

interface ProjectCardProps {
  project: ProjectsPageProject;
  projectCreator?: { full_name: string; email: string };
  showAdminActions?: boolean;
  onViewProject?: (project: ProjectsPageProject) => void;
  onNavigateToEdit?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onNavigateToCollaboration?: (projectId: string) => void;
}

function SummaryItem({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-2 font-data text-[18px] font-light text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function ProjectCard({
  project,
  projectCreator,
  showAdminActions = false,
  onViewProject,
  onNavigateToEdit,
  onDeleteProject,
  onNavigateToCollaboration
}: ProjectCardProps) {
  const progress = getProjectProgress(project);
  const taskStats = getProjectTaskStats(project);
  const stateLabel = getProjectStateLabel(project);
  const stateVariant = getProjectStateVariant(project);
  const totalPhases = project.fases?.length ?? 0;

  return (
    <article className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-[border-color] duration-150 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
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
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>Progreso</span>
          <span className="font-data text-[var(--text-primary)]">{progress}%</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-[var(--bg-subtle)]">
          <div
            className="h-1 rounded-full bg-[var(--signal)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryItem label="Tareas completadas" value={taskStats.completed} />
        <SummaryItem label="Tareas totales" value={taskStats.total} />
        <SummaryItem label="Fases" value={totalPhases} />
      </div>

      <div className="mt-5 space-y-2 text-[13px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          <span>Última actualización: {formatDateSafe(project.updated_at)}</span>
        </div>
        {showAdminActions && projectCreator ? (
          <p className="truncate text-[var(--text-tertiary)]">
            Cliente: {projectCreator.full_name || projectCreator.email}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          className="h-10 rounded-[10px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
          onClick={() => onViewProject?.(project)}
          type="button"
        >
          Ver detalles
        </Button>

        {stateVariant !== 'success' ? (
          <Button
            className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigateToCollaboration?.(project.id)}
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
