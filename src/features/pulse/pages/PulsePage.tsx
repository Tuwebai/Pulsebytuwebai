import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeIn, MetricCard, Skeleton } from '@/core/components';
import AnimatedList from '@/core/components/AnimatedList';
import type { Period } from '@/data/types/pulse';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import PulseChart from '../components/PulseChart';
import PeriodSelector from '../components/PeriodSelector';
import { usePulseMetrics } from '../hooks/usePulseMetrics';
import { usePulsePeriod } from '../hooks/usePulsePeriod';
import { getDaysInRange } from '../services/pulse.service';

export default function PulsePage() {
  const navigate = useNavigate();
  const { period, setPeriod } = usePulsePeriod();
  const { projectId, domain, ga4PropertyId, loading: projectLoading } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);

  const loading = projectLoading || isLoading;
  const hasProject = Boolean(projectId);
  const hasGa4 = Boolean(ga4PropertyId);
  const averagePerDay = data ? Math.round(data.visits / getDaysInRange(period)) : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Tu web este mes</h1>
          <p className="text-[13px] text-[var(--text-tertiary)]">
            {data ? `${data.dateRange.from} → ${data.dateRange.to}` : 'sin datos todavia'}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <PeriodSelector value={period} onChange={(nextPeriod) => setPeriod(nextPeriod as Period)} disabled={!projectId} />
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!domain}
            onClick={() => {
              if (domain) {
                window.open(`https://${domain}`, '_blank', 'noopener,noreferrer');
              }
            }}
            type="button"
          >
            Ver mi sitio <ExternalLink size={14} strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {!hasProject && !loading ? (
        <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-6 text-sm text-[var(--text-secondary)]">
          Tu proyecto esta siendo configurado. Volve pronto.
        </div>
      ) : null}

      {hasProject && !hasGa4 ? (
        <div className="sticky top-20 rounded-[14px] border border-[color:rgba(245,158,11,0.28)] bg-[color:rgba(245,158,11,0.12)] px-4 py-3.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--warning)]" />
            <div>
              <p className="font-medium leading-5 text-[var(--text-primary)]">Conecta tu dominio para ver los datos reales.</p>
              <p className="mt-1 text-[13px] leading-5 text-[color:rgba(240,244,255,0.82)]">
                Tu equipo de TuWebAI lo configura automaticamente al entregar tu proyecto.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatedList
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        disabled={loading}
        key={`${period}-${loading ? 'loading' : 'ready'}`}
        staggerMs={60}
      >
        <MetricCard
          label="Visitas este mes"
          value={data?.visits ?? null}
          delta={data?.visitsDelta === null ? undefined : data?.visitsDelta}
          loading={loading}
        />
        <MetricCard
          label="Consultas recibidas"
          value={data?.contacts ?? null}
          delta={data?.contactsDelta === null ? undefined : data?.contactsDelta}
          loading={loading}
        />
        <MetricCard
          label="Pagina mas visitada"
          value={data?.topPages[0]?.path ?? null}
          period={data?.topPages[0] ? `${data.topPages[0].visits} visitas` : undefined}
          loading={loading}
        />
        <MetricCard
          label="Promedio por dia"
          value={averagePerDay}
          unit="visitas/dia"
          loading={loading}
        />
      </AnimatedList>

      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Visitas por dia</p>
        <div className="mt-4">
          <PulseChart data={data?.chartData ?? []} height={180} loading={loading} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Paginas mas visitadas</h2>
          </div>

          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                  <th className="px-5 py-3 font-medium">Pagina</th>
                  <th className="px-5 py-3 font-medium">Visitas</th>
                  <th className="px-5 py-3 font-medium">% del total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b border-[var(--border-subtle)] last:border-b-0">
                      <td className="px-5 py-3 text-sm" colSpan={3}>
                        <div className="grid grid-cols-[minmax(0,1fr)_96px_96px] items-center gap-4 transition-opacity duration-150 ease-out">
                          <Skeleton height="16px" rounded="sm" width="100%" />
                          <Skeleton height="16px" rounded="sm" width="64px" />
                          <Skeleton height="16px" rounded="sm" width="72px" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : data?.topPages.length ? (
                  data.topPages.map((page, index) => (
                    <tr key={page.path} className={index === data.topPages.length - 1 ? '' : 'border-b border-[var(--border-subtle)]'}>
                      <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                        <FadeIn>{page.path}</FadeIn>
                      </td>
                      <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">
                        <FadeIn>{page.visits}</FadeIn>
                      </td>
                      <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">
                        <FadeIn>{page.percentage}%</FadeIn>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-[var(--text-tertiary)]" colSpan={3}>
                      <FadeIn>Todavia no hay datos suficientes para este periodo.</FadeIn>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
          <div>
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Resumen del periodo</h2>
            <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Lectura rapida de tus metricas</p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
              <span className="text-[13px] text-[var(--text-secondary)]">Total de visitas</span>
              <span className="ml-auto font-data text-[13px] text-[var(--text-primary)]">{data?.visits ?? 0}</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              <span className="text-[13px] text-[var(--text-secondary)]">Consultas recibidas</span>
              <span className="ml-auto font-data text-[13px] text-[var(--text-primary)]">{data?.contacts ?? 0}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
              <span className="text-[13px] text-[var(--text-secondary)]">Promedio de sesion</span>
              <span className="ml-auto font-data text-[13px] text-[var(--text-primary)]">{data?.avgSessionSec ?? 0}s</span>
            </div>
          </div>

          <button
            className="mt-4 text-sm text-[var(--signal)]"
            onClick={() => navigate('/dashboard/configuracion')}
            type="button"
          >
            Revisar configuracion →
          </button>
        </div>
      </section>
    </div>
  );
}
