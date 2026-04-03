import { ArrowRight, CalendarClock, CheckCircle2, ListTodo, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AdminProjectTrackingQuickActions } from '@/features/admin/projects-tracking/components/AdminProjectTrackingQuickActions';
import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import type { AdminProjectTrackingPhase } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseCardProps {
  phase: AdminProjectTrackingPhase;
  index: number;
  projectId: string;
  quickActions?: AdminProjectTrackingResolutionAction[];
}

export function AdminProjectPhaseCard({
  phase,
  index,
  projectId,
  quickActions = [],
}: AdminProjectPhaseCardProps) {
  return (
    <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              Fase {index + 1}
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{phase.descripcion ?? phase.key}</h2>
          </div>
          <span className="rounded-full border border-[var(--success)]/20 bg-[var(--success-dim)] px-3 py-1 text-xs font-medium text-[var(--success)]">
            {phase.estado}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 p-3">
            <UserRound className="mb-2 h-4 w-4 text-[var(--signal)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Responsable</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {phase.responsable ?? 'Sin responsable'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 p-3">
            <CalendarClock className="mb-2 h-4 w-4 text-[var(--warning)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Fecha objetivo</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {phase.fechaEntrega ?? phase.fechaFin ?? 'Sin fecha'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 p-3">
            <ListTodo className="mb-2 h-4 w-4 text-[var(--signal)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Tareas</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{phase.tareas.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          <span>{phase.comentariosCount} comentarios operativos cargados</span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <AdminProjectTrackingQuickActions actions={quickActions} />

          <div className="flex justify-end">
            <Link
              to={`/admin/proyectos/${projectId}/seguimiento/fases/${encodeURIComponent(phase.key)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
            >
              Ver fase
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
