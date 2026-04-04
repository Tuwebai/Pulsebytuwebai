import GooglePerformanceChart from './GooglePerformanceChart';
import type { GoogleSearchConsoleMetricKey, GoogleSearchConsoleOverview } from '@/data/types/google';
import { getGooglePeriodLabel } from '../services/googleOverview.service';

interface GoogleOverviewCardProps {
  activeMetrics: GoogleSearchConsoleMetricKey[];
  data: GoogleSearchConsoleOverview | undefined;
  isLoading?: boolean;
  onToggleMetric: (metric: GoogleSearchConsoleMetricKey) => void;
}

const metricCards: Array<{
  color: string;
  description: string;
  key: GoogleSearchConsoleMetricKey;
  label: string;
}> = [
  { color: '#5AA7FF', description: 'Clics totales', key: 'clicks', label: 'Clics' },
  { color: '#7F64FF', description: 'Impresiones totales', key: 'impressions', label: 'Impresiones' },
  { color: '#10B981', description: 'CTR medio', key: 'ctr', label: 'CTR' },
  { color: '#F59E0B', description: 'Posición media', key: 'position', label: 'Posición' },
];

function formatMetricValue(metric: GoogleSearchConsoleMetricKey, data: GoogleSearchConsoleOverview | undefined) {
  if (!data) {
    return '—';
  }

  if (metric === 'clicks') {
    return data.clicks.toLocaleString('es-AR');
  }

  if (metric === 'impressions') {
    return data.impressions.toLocaleString('es-AR');
  }

  if (metric === 'ctr') {
    return data.ctr === null ? '—' : `${data.ctr.toLocaleString('es-AR')} %`;
  }

  return data.position === null ? '—' : data.position.toLocaleString('es-AR');
}

export default function GoogleOverviewCard({
  activeMetrics,
  data,
  isLoading = false,
  onToggleMetric,
}: GoogleOverviewCardProps) {
  const periodLabel = data ? getGooglePeriodLabel(data.period) : '28 días';

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Rendimiento</p>
          <h2 className="mt-3 text-[18px] font-medium text-[var(--text-primary)]">Resumen Pulse inspirado en Search Console</h2>
          <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
            {data ? `Período actual: ${periodLabel}. Tocá las tarjetas para prender o apagar cada línea del gráfico.` : 'Todavía no hay un resumen listo para mostrar.'}
          </p>
        </div>
        <p className="text-[12px] text-[var(--text-tertiary)]">{data?.lastSyncLabel ?? 'Sin actualización registrada.'}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const isActive = activeMetrics.includes(metric.key);

          return (
            <button
              key={metric.key}
              className="rounded-[20px] border p-4 text-left transition-transform hover:-translate-y-0.5"
              onClick={() => onToggleMetric(metric.key)}
              style={{
                background: isActive ? metric.color : 'rgba(15, 23, 42, 0.65)',
                borderColor: isActive ? metric.color : 'rgba(255,255,255,0.08)',
                color: isActive ? '#FFFFFF' : 'var(--text-primary)',
              }}
              type="button"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: isActive ? 'rgba(255,255,255,0.78)' : 'var(--text-tertiary)' }}>
                {metric.description}
              </p>
              <p className="mt-3 text-[17px] font-medium">{metric.label}</p>
              <p className="mt-2 font-data text-[36px] font-light leading-none">{formatMetricValue(metric.key, data)}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-[var(--bg-elevated)]/55 p-4">
        <GooglePerformanceChart activeMetrics={activeMetrics} data={data?.chartData ?? []} loading={isLoading} />
      </div>
    </section>
  );
}
