import { AlertTriangle, ShieldAlert, TriangleAlert } from 'lucide-react';

interface AdminProjectAlertsHeroProps {
  highAlertsCount: number;
  mediumAlertsCount: number;
  totalAlertsCount: number;
}

export function AdminProjectAlertsHero({
  highAlertsCount,
  mediumAlertsCount,
  totalAlertsCount,
}: AdminProjectAlertsHeroProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Alertas
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Desvios operativos detectados
          </h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse resume bloqueos, vencimientos y owners faltantes para que el equipo entre directo al punto que hoy frena el proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:min-w-[320px] sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-dim)] p-4">
            <ShieldAlert className="mb-2 h-4 w-4 text-[var(--danger)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--danger)]/80">Altas</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{highAlertsCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning-dim)] p-4">
            <TriangleAlert className="mb-2 h-4 w-4 text-[var(--warning)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--warning)]/80">Medias</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{mediumAlertsCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <AlertTriangle className="mb-2 h-4 w-4 text-[var(--signal)]" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Total</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{totalAlertsCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
