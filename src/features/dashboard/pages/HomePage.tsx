import { CreditCard, FolderOpen, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, PulseEmptyState, Skeleton } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { usePulseOverview } from '@/hooks/usePulseOverview';
import PulseTrendBars from '@/features/pulse/components/PulseTrendBars';

function getProjectStatusVariant(status?: string | null): 'signal' | 'success' | 'default' {
  if (!status) {
    return 'default';
  }

  if (status === 'production' || status === 'completed') {
    return 'success';
  }

  if (status === 'development' || status === 'in_progress') {
    return 'signal';
  }

  return 'default';
}

function getProjectStatusLabel(status?: string | null): string {
  if (!status) {
    return 'Mantenimiento';
  }

  if (status === 'production' || status === 'completed') {
    return 'Entregado';
  }

  if (status === 'development' || status === 'in_progress') {
    return 'En desarrollo';
  }

  return 'Mantenimiento';
}

export default function HomePage() {
  const navigate = useNavigate();
  const { getUserProjects } = useApp();
  const projects = getUserProjects();
  const primaryProject = projects[0];
  const projectDomain = primaryProject?.domain || '#';
  const { loading, hasDomain, data } = usePulseOverview('this_month');
  const hasMetrics = Boolean(data?.hasMetrics);
  const activityItems =
    data?.recentHighlights.length
      ? data.recentHighlights
      : [
          { label: 'Nueva consulta recibida en tu web', timestamp: 'Hoy' },
          { label: 'Ticket #3 resuelto', timestamp: 'Ayer' },
          { label: '47 visitas en tu web', timestamp: 'Lunes' }
        ];

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-[var(--signal-border)] bg-[var(--bg-surface)] p-5 md:p-7">
        {!hasDomain ? (
          <PulseEmptyState onConnect={() => navigate('/dashboard/configuracion')} />
        ) : loading ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <Skeleton height="14px" rounded="sm" width="180px" />
                <Skeleton height="14px" rounded="sm" width="120px" />
              </div>
              <Skeleton height="32px" rounded="full" width="96px" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton height="96px" rounded="md" />
              <Skeleton height="96px" rounded="md" />
            </div>

            <PulseTrendBars data={[]} loading />
          </div>
        ) : !hasMetrics ? (
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Este mes tu web tuvo</p>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Tu sitio ya esta conectado.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
              Apenas entre la primera sincronizacion vas a ver aca visitas, consultas y las paginas que mejor estan funcionando.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-tertiary)]">
              <button
                className="rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                onClick={() => navigate('/dashboard/pulse')}
                type="button"
              >
                Ir a Pulse
              </button>
              <button
                className="rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                onClick={() => window.open(projectDomain, '_blank', 'noopener,noreferrer')}
                type="button"
              >
                Ver mi sitio ↗
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                  Este mes tu web tuvo
                </p>
              </div>

              <button
                className="self-start rounded-full border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-tertiary)]"
                type="button"
              >
                Este mes ▼
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-data text-[52px] font-light leading-none text-[var(--text-primary)] md:text-[64px]">
                  {data.visits.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">visitas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {typeof data.visitsDelta === 'number' ? `▲ ${data.visitsDelta}% vs periodo anterior` : 'Primer periodo con datos'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-data text-[52px] font-light leading-none text-[var(--text-primary)] md:text-[64px]">
                  {data.contacts.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">consultas recibidas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {typeof data.contactsDelta === 'number' ? `▲ ${data.contactsDelta}% vs periodo anterior` : 'Primer periodo con datos'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <PulseTrendBars data={data.series} />
              <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--text-tertiary)]">
                <span>Visitas por dia durante {data.periodLabel}</span>
                <button
                  className="rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                  onClick={() => window.open(projectDomain, '_blank', 'noopener,noreferrer')}
                  type="button"
                >
                  Ver mi sitio ↗
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)]"
          onClick={() => navigate('/dashboard/proyecto')}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <FolderOpen className="text-[var(--signal)]" size={20} strokeWidth={1.5} />
            <Badge variant={getProjectStatusVariant(primaryProject?.status)} size="sm">
              {getProjectStatusLabel(primaryProject?.status)}
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Mi Proyecto</h3>
          <div className="mt-4 h-2 rounded-full bg-[var(--bg-subtle)]">
            <div className="h-2 w-[85%] rounded-full bg-[var(--signal)]" />
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Quedan 2 tareas para la entrega</p>
          <p className="mt-4 text-sm text-[var(--signal)]">Ver proyecto →</p>
        </button>

        <button
          className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)]"
          onClick={() => navigate('/dashboard/pagos')}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <CreditCard className="text-[var(--success)]" size={20} strokeWidth={1.5} />
            <Badge size="sm" variant="success">
              Al dia
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Pagos</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Web Comercial · $780.000 ARS</p>
          <p className="mt-4 text-sm text-[var(--success)]">Ver historial →</p>
        </button>

        <button
          className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)]"
          onClick={() => navigate('/dashboard/soporte')}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <LifeBuoy className="text-[var(--text-secondary)]" size={20} strokeWidth={1.5} />
            <Badge size="sm" variant="default">
              0 tickets abiertos
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Soporte</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Tu equipo de TuWebAI sigue disponible.</p>
          <p className="mt-4 text-sm text-[var(--signal)]">Abrir ticket →</p>
        </button>
      </section>

      <section className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Actividad reciente</h2>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {activityItems.map((item, index) => (
            <div key={`${item.label}-${item.timestamp}`} className="flex items-center gap-3 px-5 py-4">
              <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-[var(--signal)]' : 'bg-[var(--text-tertiary)]'}`} />
              <span className="text-[13px] text-[var(--text-secondary)]">{item.label}</span>
              <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
