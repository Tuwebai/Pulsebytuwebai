import { Skeleton } from '@/core/components';
import AnimatedList, { AnimatedReveal } from '@/core/components/AnimatedList';
import type { ChartDataPoint } from '@/data/types/pulse';
import PulseChart from '@/features/pulse/components/PulseChart';
import PulseDomainRequestGate from '@/features/pulse/components/PulseDomainRequestGate';

interface HomeHeroProps {
  canOpenSite: boolean;
  chartData: ChartDataPoint[];
  consultationRate: number;
  consultationRateDelta: number | null;
  connectionReady: boolean;
  contacts: number;
  contactsDelta: number | null;
  dailyAverageVisits: number;
  dailyAverageVisitsDelta: number | null;
  ga4PropertyId: string | null;
  hasProject: boolean;
  loading: boolean;
  onOpenSite: () => void;
  visits: number;
  visitsDelta: number | null;
}

function MetricBlock({
  delta,
  label,
  loading,
  suffix,
  value,
}: {
  delta: number | null;
  label: string;
  loading: boolean;
  suffix?: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-slate-100">{label}</p>
      <div className="font-data text-[clamp(2.8rem,5vw,4rem)] font-light leading-none tracking-tight text-slate-50">
        {loading ? <Skeleton height="64px" rounded="sm" width="160px" /> : `${value.toLocaleString('es-AR')}${suffix ?? ''}`}
      </div>
      <p className={`text-xs ${delta === null || delta === 0 ? 'text-emerald-400' : delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {loading
          ? '...'
          : `${delta !== null ? (delta > 0 ? '+' : '') : ''}${delta ?? 0}% vs. mes anterior`}
      </p>
    </div>
  );
}

export default function HomeHero({
  canOpenSite,
  chartData,
  consultationRate,
  consultationRateDelta,
  connectionReady,
  contacts,
  contactsDelta,
  dailyAverageVisits,
  dailyAverageVisitsDelta,
  ga4PropertyId,
  hasProject,
  loading,
  onOpenSite,
  visits,
  visitsDelta,
}: HomeHeroProps) {
  return (
    <AnimatedReveal
      className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5"
      data-tour="home-hero"
      disabled={loading}
    >
      {loading ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
              <h1 className="mt-2 text-xl font-medium text-slate-50">Este mes tu web tuvo</h1>
            </div>

            <button
              className="inline-flex items-center rounded-full border border-white/10 bg-[var(--bg-base)]/70 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/15 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canOpenSite}
              onClick={onOpenSite}
              type="button"
            >
              Ver mi sitio
            </button>
          </div>

          <AnimatedList className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" disabled={loading} staggerMs={70}>
            <MetricBlock delta={visitsDelta} label="Visitas registradas" loading={loading} value={visits} />
            <MetricBlock delta={contactsDelta} label="Consultas recibidas" loading={loading} value={contacts} />
            <MetricBlock delta={consultationRateDelta} label="Tasa de consulta" loading={loading} suffix="%" value={consultationRate} />
            <MetricBlock delta={dailyAverageVisitsDelta} label="Promedio diario" loading={loading} value={dailyAverageVisits} />
          </AnimatedList>

          <div className="rounded-[20px] border border-white/10 bg-[var(--bg-base)]/55 px-4 py-4">
            <PulseChart data={chartData} height={96} loading={loading || !hasProject} />
          </div>
        </div>
      ) : !connectionReady ? (
        <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} hasProject={hasProject} />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
              <h1 className="mt-2 text-xl font-medium text-slate-50">Este mes tu web tuvo</h1>
            </div>

            <button
              className="inline-flex items-center rounded-full border border-white/10 bg-[var(--bg-base)]/70 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/15 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canOpenSite}
              onClick={onOpenSite}
              type="button"
            >
              Ver mi sitio
            </button>
          </div>

          <AnimatedList className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" disabled={loading} staggerMs={70}>
            <MetricBlock delta={visitsDelta} label="Visitas registradas" loading={loading} value={visits} />
            <MetricBlock delta={contactsDelta} label="Consultas recibidas" loading={loading} value={contacts} />
            <MetricBlock delta={consultationRateDelta} label="Tasa de consulta" loading={loading} suffix="%" value={consultationRate} />
            <MetricBlock delta={dailyAverageVisitsDelta} label="Promedio diario" loading={loading} value={dailyAverageVisits} />
          </AnimatedList>

          <div className="rounded-[20px] border border-white/10 bg-[var(--bg-base)]/55 px-4 py-4">
            <PulseChart data={chartData} height={96} loading={loading || !hasProject} />
          </div>
        </div>
      )}
    </AnimatedReveal>
  );
}
