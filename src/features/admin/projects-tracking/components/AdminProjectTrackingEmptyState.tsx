import { ArrowLeft, CheckSquare2, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectTrackingEmptyStateProps {
  onBack: () => void;
  onEditProject: () => void;
}

export function AdminProjectTrackingEmptyState({
  onBack,
  onEditProject,
}: AdminProjectTrackingEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          <CheckSquare2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
            Todavía no hay seguimiento cargado
          </h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Este proyecto todavía no tiene fases ni tareas críticas en la base operativa. El siguiente paso es cargar la primera estructura de seguimiento para que Pulse pueda mostrar bloqueos, responsables y fechas objetivo.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            onClick={onEditProject}
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Volver y editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a proyectos
          </Button>
        </div>
      </div>
    </section>
  );
}
