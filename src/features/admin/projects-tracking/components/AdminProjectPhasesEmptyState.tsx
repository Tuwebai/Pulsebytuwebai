import { KanbanSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectPhasesEmptyStateProps {
  onBack: () => void;
  onCreatePhase: () => void;
  onEditProject: () => void;
}

export function AdminProjectPhasesEmptyState({
  onBack,
  onCreatePhase,
  onEditProject,
}: AdminProjectPhasesEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-signal/20 bg-signal/12 text-signal">
          <KanbanSquare className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Todavía no hay fases operativas
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          Este proyecto todavía no tiene etapas cargadas en la base operativa. El siguiente paso es definir la
          estructura inicial para que Pulse pueda mostrar avance, responsables y fechas objetivo.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={onCreatePhase}
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
          >
            Crear primera fase
          </Button>
          <Button
            type="button"
            onClick={onEditProject}
            className="rounded-xl border border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
          >
            Volver y editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
          >
            Volver a proyectos
          </Button>
        </div>
      </div>
    </section>
  );
}
