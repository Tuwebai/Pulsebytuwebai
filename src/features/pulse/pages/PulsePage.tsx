import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricCard, Skeleton } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import PeriodSelector from '../components/PeriodSelector';
import { MOCK_PULSE_DATA } from '../constants/mockPulseData';

export default function PulsePage() {
  const navigate = useNavigate();
  const { getUserProjects } = useApp();
  const [period, setPeriod] = useState(MOCK_PULSE_DATA.period);
  const primaryProject = getUserProjects()[0];
  const domain = primaryProject?.domain;
  const hasDomain = Boolean(domain);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Tu web este mes</h1>
          <p className="text-[13px] text-[var(--text-tertiary)]">{MOCK_PULSE_DATA.titleMonth}</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <PeriodSelector disabled={!hasDomain} onChange={setPeriod} value={period} />
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
          Conectá tu dominio para ver los datos reales →
        </button>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          delta={MOCK_PULSE_DATA.visitsDelta}
          label="Visitas este mes"
          loading={!hasDomain}
          period={MOCK_PULSE_DATA.titleMonth}
          value={MOCK_PULSE_DATA.visits}
        />
        <MetricCard
          delta={MOCK_PULSE_DATA.contactsDelta}
          label="Consultas recibidas"
          loading={!hasDomain}
          period={MOCK_PULSE_DATA.titleMonth}
          value={MOCK_PULSE_DATA.contacts}
        />
        <MetricCard
          label="Página más visitada"
          loading={!hasDomain}
          period={`${MOCK_PULSE_DATA.topPageVisits} visitas`}
          value={MOCK_PULSE_DATA.topPage}
        />
        <MetricCard label="Tiempo promedio" loading={!hasDomain} period="en el sitio" value={MOCK_PULSE_DATA.averageTime} />
      </section>

      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Visitas por día — últimos 30 días
        </p>
        <div className="mt-4">
          <Skeleton height="160px" rounded="md" />
        </div>
        <p className="mt-3 text-[12px] italic text-[var(--text-tertiary)]">
          El gráfico se activa cuando se conecta tu dominio.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Páginas más visitadas</h2>
          </div>

          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                  <th className="px-5 py-3 font-medium">Página</th>
                  <th className="px-5 py-3 font-medium">Visitas</th>
                  <th className="px-5 py-3 font-medium">% del total</th>
                </tr>
              </thead>
              <tbody>
                {hasDomain
                  ? MOCK_PULSE_DATA.pages.map((page, index) => (
                      <tr
                        key={page.path}
                        className={index === MOCK_PULSE_DATA.pages.length - 1 ? '' : 'border-b border-[var(--border-subtle)]'}
                      >
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
                  : Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b border-[var(--border-subtle)] last:border-b-0">
                        <td className="px-5 py-3" colSpan={3}>
                          <Skeleton height="16px" rounded="sm" />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {hasDomain ? (
          <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div>
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Consultas recibidas</h2>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Contactos a través de tu web</p>
            </div>

            <div className="mt-5 space-y-3">
              {MOCK_PULSE_DATA.recentContacts.map((contact) => (
                <div key={`${contact.label}-${contact.timestamp}`} className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-b-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                  <span className="text-[13px] text-[var(--text-secondary)]">{contact.label}</span>
                  <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">{contact.timestamp}</span>
                </div>
              ))}
            </div>

            <button
              className="mt-4 text-sm text-[var(--signal)]"
              onClick={() => navigate('/dashboard/configuracion')}
              type="button"
            >
              ¿Querés recibir notificaciones? Activar alertas →
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
