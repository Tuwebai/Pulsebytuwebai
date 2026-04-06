import { ArrowLeft, Plus, SquarePen } from 'lucide-react';

import { Button } from '@/core/ui/button';
import type { AdminProjectTrackingPhase } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailHeroProps {
  phase: AdminProjectTrackingPhase;
  backLabel: string;
  onBackToPhases: () => void;
  onCreateTask: () => void;
  onEditPhase: () => void;
}

export function AdminProjectPhaseDetailHero({
  phase,
  backLabel,
  onBackToPhases,
  onCreateTask,
  onEditPhase,
}: AdminProjectPhaseDetailHeroProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToPhases}
            className="mb-2 h-auto px-0 text-[var(--text-secondary)] hover:bg-transparent hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Detalle de fase
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {phase.descripcion ?? phase.key}
          </h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Vista puntual de estado, responsable, fecha objetivo y tareas asociadas a esta etapa del proyecto.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <span className="rounded-full border border-[var(--success)]/20 bg-[var(--success-dim)] px-4 py-2 text-sm font-medium text-[var(--success)]">
            {phase.estado}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={onCreateTask}
              className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear tarea
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onEditPhase}
              className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
            >
              <SquarePen className="mr-2 h-4 w-4" />
              Editar fase
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
