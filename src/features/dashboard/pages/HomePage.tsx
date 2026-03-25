import { CreditCard, FolderOpen, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, PulseEmptyState, Skeleton } from '@/core/components';
import AnimatedList, { AnimatedReveal } from '@/core/components/AnimatedList';
import { useApp } from '@/contexts/AppContext';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import PulseChart from '@/features/pulse/components/PulseChart';
import { usePulseMetrics } from '@/features/pulse/hooks/usePulseMetrics';
import { usePulsePeriod } from '@/features/pulse/hooks/usePulsePeriod';
import { usePulseRealtime } from '@/features/pulse/hooks/usePulseRealtime';

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
  const { period } = usePulsePeriod();
  const { projectId, domain, loading: projectLoading } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);

  usePulseRealtime(projectId);

  const loading = projectLoading || isLoading;
  const hasProject = Boolean(projectId);
  const hasDomain = Boolean(domain);
  const canOpenSite = Boolean(domain);

  return (
    <div className="space-y-6">
      <AnimatedReveal
        className="rounded-[20px] border border-[var(--signal-border)] bg-[var(--bg-surface)] p-5 md:p-7"
        data-tour="home-hero"
        disabled={loading}
        key={`${period}-${loading ? 'loading' : hasDomain && data?.hasData ? 'ready' : 'empty'}`}
      >
        {!hasProject && !loading ? (
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Tu proyecto se está configurando.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
              Apenas tu equipo termine la configuración inicial, vas a ver acá el rendimiento real de tu web.
            </p>
          </div>
        ) : !hasDomain || !data?.hasData ? (
          <PulseEmptyState onConnect={() => navigate('/dashboard/configuracion')} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Este mes tu web tuvo</p>
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
                  {loading ? <Skeleton height="64px" rounded="sm" width="180px" /> : data.visits.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">visitas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {loading
                    ? '...'
                    : data.visitsDelta !== null
                      ? `▲ ${data.visitsDelta}% vs período anterior`
                      : 'Sin comparativa disponible'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-data text-[52px] font-light leading-none text-[var(--text-primary)] md:text-[64px]">
                  {loading ? <Skeleton height="64px" rounded="sm" width="180px" /> : data.contacts.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">consultas recibidas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {loading
                    ? '...'
                    : data.contactsDelta !== null
                      ? `▲ ${data.contactsDelta}% vs período anterior`
                      : 'Sin comparativa disponible'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <PulseChart data={data?.chartData ?? []} height={80} loading={loading || !projectId} />
              <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--text-tertiary)]">
                <span>Visitas por día</span>
                <button
                  className="rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canOpenSite}
                  onClick={() => {
                    if (domain) {
                      window.open(`https://${domain}`, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate('/dashboard/configuracion');
                    }
                  }}
                  type="button"
                >
                  Ver mi sitio ↗
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatedReveal>

      <AnimatedList className="grid gap-4 md:grid-cols-3" staggerMs={80}>
        <button
          className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)]"
          data-tour="home-project-card"
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
          data-tour="home-payments-card"
          onClick={() => navigate('/dashboard/pagos')}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <CreditCard className="text-[var(--success)]" size={20} strokeWidth={1.5} />
            <Badge size="sm" variant="success">
              Al día
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Pagos</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Web Comercial · $780.000 ARS</p>
          <p className="mt-4 text-sm text-[var(--success)]">Ver historial →</p>
        </button>

        <button
          className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)]"
          data-tour="home-support-card"
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
      </AnimatedList>
    </div>
  );
}
