import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricCard, Skeleton } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { usePulseOverview } from '@/hooks/usePulseOverview';
import type { PulsePeriod } from '@/services/pulse/pulseMetricsService';
import PeriodSelector from '../components/PeriodSelector';
import PulseTrendBars from '../components/PulseTrendBars';

export default function PulsePage() {
  const navigate = useNavigate();
  const { getUserProjects } = useApp();
  const [period, setPeriod] = useState<PulsePeriod>('this_month');
  const primaryProject = getUserProjects()[0];
  const domain = primaryProject?.domain;
  const hasDomain = Boolean(domain);
  const { loading, error, data } = usePulseOverview(period);
  const hasMetrics = Boolean(data?.hasMetrics);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Tu web este mes</h1>
          <p className="text-[13px] text-[var(--text-tertiary)]">{data?.periodLabel || 'sin datos todavia'}</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <PeriodSelector disabled={!hasDomain} onChange={(nextPeriod) => setPeriod(nextPeriod as PulsePeriod)} value={period} />
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-secondary)]"
            onClick={() => window.open(domain || '#', '_blank', 'noopener,noreferrer')}
            type="button"
          >
            Ver mi sitio <ExternalLink size={14} strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {!hasDomain ? (
        <button
          className="w-full rounded-[14px] border border-[var(--signal-border)] bg-[var(--signal-glow)] px-4 py-3 text-left text-sm text-[var(--signal)]"
          onClick={() => navigate('/dashboard/configuracion')}
          type="button"
        >
          Conecta tu dominio para ver los datos reales →
        </button>
      ) : null}

      {error ? (
        <div className="rounded-[14px] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          delta={data?.visitsDelta}
          label="Visitas este mes"
          loading={loading}
          period={data?.periodLabel}
          value={hasMetrics ? data?.visits ?? 0 : null}
        />
        <MetricCard
          delta={data?.contactsDelta}
          label="Consultas recibidas"
          loading={loading}
          period={data?.periodLabel}
          value={hasMetrics ? data?.contacts ?? 0 : null}
        />
        <MetricCard
          label="Pagina mas visitada"
          loading={loading}
          period={hasMetrics ? `${data?.topPageVisits || 0} visitas` : undefined}
          value={hasMetrics ? data?.topPage || 'Sin dato' : null}
        />
        <MetricCard
          label="Tiempo promedio"
          loading={loading}
          period="en el sitio"
          value={hasMetrics ? data?.averageTime || '0:00' : null}
        />
      </section>

      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Visitas por dia</p>
        <div className="mt-4">
          <PulseTrendBars
            data={data?.series || []}
            emptyMessage="Tu sitio ya esta conectado. Apenas entre la primera sincronizacion vas a ver la tendencia diaria aca."
            loading={loading}
          />
        </div>
        <p className="mt-3 text-[12px] italic text-[var(--text-tertiary)]">
          {hasMetrics ? `Serie real para ${data?.periodLabel}.` : 'La tendencia aparece cuando entre la primera sincronizacion.'}
        </p>
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
                      <td className="px-5 py-3" colSpan={3}>
                        <Skeleton height="16px" rounded="sm" />
                      </td>
                    </tr>
                  ))
                ) : hasMetrics && data?.pages.length ? (
                  data.pages.map((page, index) => (
                    <tr key={page.path} className={index === data.pages.length - 1 ? '' : 'border-b border-[var(--border-subtle)]'}>
                      <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-2">
                          {page.path}
                          {page.path.startsWith('/') ? <ExternalLink size={12} strokeWidth={1.5} /> : null}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">{page.visits}</td>
                      <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">{page.percent}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-[var(--text-tertiary)]" colSpan={3}>
                      Todavia no hay paginas registradas para este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasDomain ? (
          <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div>
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Actividad de tu web</h2>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Resumen reciente de Pulse</p>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => <Skeleton key={`activity-${index}`} height="16px" rounded="sm" />)
              ) : data?.recentHighlights.length ? (
                data.recentHighlights.map((contact) => (
                  <div key={`${contact.label}-${contact.timestamp}`} className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-b-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                    <span className="text-[13px] text-[var(--text-secondary)]">{contact.label}</span>
                    <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">{contact.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-[var(--border-default)] px-4 py-6 text-sm text-[var(--text-tertiary)]">
                  Tu sitio ya esta conectado. Cuando entren datos vamos a mostrar aca el movimiento reciente de visitas y consultas.
                </div>
              )}
            </div>

            <button
              className="mt-4 text-sm text-[var(--signal)]"
              onClick={() => navigate('/dashboard/configuracion')}
              type="button"
            >
              Queres recibir notificaciones? Activar alertas →
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
