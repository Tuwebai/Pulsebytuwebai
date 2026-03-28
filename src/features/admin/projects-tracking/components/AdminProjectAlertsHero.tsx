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
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
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
          <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4">
            <ShieldAlert className="mb-2 h-4 w-4 text-rose-300" />
            <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">Altas</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{highAlertsCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4">
            <TriangleAlert className="mb-2 h-4 w-4 text-amber-300" />
            <p className="text-xs uppercase tracking-[0.16em] text-amber-200/80">Medias</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{mediumAlertsCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <AlertTriangle className="mb-2 h-4 w-4 text-signal" />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Total</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{totalAlertsCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
