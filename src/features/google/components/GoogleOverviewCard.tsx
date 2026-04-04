import GoogleOverviewMetrics from './GoogleOverviewMetrics';
import type { GoogleSearchConsoleOverview } from '@/data/types/google';

interface GoogleOverviewCardProps {
  data: GoogleSearchConsoleOverview | undefined;
  isConnected: boolean;
  isLoading?: boolean;
}

export default function GoogleOverviewCard({
  data,
  isConnected,
  isLoading = false,
}: GoogleOverviewCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Resumen real</p>
      <h2 className="mt-3 text-[18px] font-medium text-[var(--text-primary)]">Cómo viene tu visibilidad en Google</h2>
      <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
        {data?.hasData
          ? `Período actual: ${data.dateRange.from} -> ${data.dateRange.to}`
          : isConnected
            ? 'La conexión ya está activa. Apenas entren más datos, Pulse los va a resumir acá.'
            : 'Primero conectá Google para que Pulse pueda empezar a leer tu rendimiento.'}
      </p>

      <div className="mt-5">
        <GoogleOverviewMetrics data={data} loading={isLoading} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/55 p-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">Estado de actualización</p>
        <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{data?.lastSyncLabel ?? 'Todavía no hay una actualización registrada.'}</p>
        {data?.lastSyncError ? (
          <p className="mt-2 text-[13px] text-[var(--warning)]">La última sincronización necesitó revisión antes de mostrar datos nuevos.</p>
        ) : null}
      </div>
    </section>
  );
}
