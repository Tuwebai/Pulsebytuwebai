import { KanbanSquare } from 'lucide-react';

import { Button } from '@/core/ui/button';

interface AdminProjectPhasesEmptyStateProps {
  onBack: () => void;
  onEditProject: () => void;
}

export function AdminProjectPhasesEmptyState({
  onBack,
  onEditProject,
}: AdminProjectPhasesEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-8 shadow-2xl">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]">
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
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            Volver y editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            Volver a proyectos
          </Button>
        </div>
      </div>
    </section>
  );
}
