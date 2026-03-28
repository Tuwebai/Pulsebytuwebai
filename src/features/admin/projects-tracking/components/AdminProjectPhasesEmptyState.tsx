import { KanbanSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectPhasesEmptyStateProps {
  onBack: () => void;
  onEditProject: () => void;
}

export function AdminProjectPhasesEmptyState({
  onBack,
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
          Usá el botón superior para crear la primera fase y definir la estructura inicial que Pulse necesita para
          mostrar avance, responsables y fechas objetivo.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
