import { KanbanSquare, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectPhasesHeroProps {
  phasesCount: number;
  onCreatePhase: () => void;
}

export function AdminProjectPhasesHero({ phasesCount, onCreatePhase }: AdminProjectPhasesHeroProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
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
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <KanbanSquare className="h-4 w-4" />
            <span>{phasesCount} fases cargadas</span>
          </div>
          <Button
            type="button"
            onClick={onCreatePhase}
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear fase
          </Button>
        </div>
      </div>
    </section>
  );
}
