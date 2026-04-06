import { KanbanSquare, Plus } from 'lucide-react';

import { Button } from '@/core/ui/button';

interface AdminProjectPhasesHeroProps {
  phasesCount: number;
  onCreatePhase: () => void;
}

export function AdminProjectPhasesHero({ phasesCount, onCreatePhase }: AdminProjectPhasesHeroProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Fases
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Seguimiento por etapas
          </h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Lee el estado del proyecto por fase, responsable y fecha objetivo sin salir del contexto operativo.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-dim)] px-4 py-3 text-sm text-[var(--success)]">
            <KanbanSquare className="h-4 w-4" />
            <span>{phasesCount} fases cargadas</span>
          </div>
          <Button
            type="button"
            onClick={onCreatePhase}
            className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear fase
          </Button>
        </div>
      </div>
    </section>
  );
}
