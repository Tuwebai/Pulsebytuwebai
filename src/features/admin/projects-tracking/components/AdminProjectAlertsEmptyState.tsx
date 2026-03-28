import { ArrowLeft, CheckCircle2, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectAlertsEmptyStateProps {
  onBackToTracking: () => void;
  onEditProject: () => void;
}

export function AdminProjectAlertsEmptyState({
  onBackToTracking,
  onEditProject,
}: AdminProjectAlertsEmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Sin alertas operativas abiertas</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse no detecta fases vencidas, tareas bloqueadas ni owners faltantes en este proyecto. El seguimiento está
            ordenado por ahora.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={onEditProject} className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90">
            <SquarePen className="mr-2 h-4 w-4" />
            Volver y editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBackToTracking}
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al resumen
          </Button>
        </div>
      </div>
    </section>
  );
}
