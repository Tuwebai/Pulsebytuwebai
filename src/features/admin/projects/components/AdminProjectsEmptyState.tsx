import { FolderOpen, Plus } from 'lucide-react';

import { Button } from '@/core/ui/button';

interface AdminProjectsEmptyStateProps {
  onCreate: () => void;
}

export function AdminProjectsEmptyState({ onCreate }: AdminProjectsEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-8 text-center shadow-2xl sm:p-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          <FolderOpen className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Todavia no hay proyectos operativos</h3>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Crea el primer proyecto para empezar a administrar entregas, avance y bloqueos desde Pulse Admin.
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear primer proyecto
        </Button>
      </div>
    </section>
  );
}
