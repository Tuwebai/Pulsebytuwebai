import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectAlertsEmptyStateProps {
  onBackToTracking: () => void;
}

export function AdminProjectAlertsEmptyState({
  onBackToTracking,
}: AdminProjectAlertsEmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-8 shadow-2xl">
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-[var(--success)]/20 bg-[var(--success-dim)] text-[var(--success)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Sin alertas operativas abiertas</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse no detecta fases vencidas, tareas bloqueadas ni owners faltantes en este proyecto. El seguimiento está
            ordenado por ahora.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToTracking}
            className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al resumen
          </Button>
        </div>
      </div>
    </section>
  );
}
