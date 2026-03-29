import { CreditCard, FolderOpen, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Skeleton } from '@/core/components';
import AnimatedList, { AnimatedReveal } from '@/core/components/AnimatedList';
import { useApp } from '@/contexts/AppContext';
import { useHomeOverviewCards } from '@/features/dashboard/hooks/useHomeOverviewCards';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import PulseChart from '@/features/pulse/components/PulseChart';
import PulseDomainRequestGate from '@/features/pulse/components/PulseDomainRequestGate';
import { usePulseMetrics } from '@/features/pulse/hooks/usePulseMetrics';
import { usePulsePeriod } from '@/features/pulse/hooks/usePulsePeriod';
import { usePulseRealtime } from '@/features/pulse/hooks/usePulseRealtime';
import { formatCurrency } from '@/lib/mercadopago';

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

function getPaymentBadgeVariant(status?: string | null): 'signal' | 'success' | 'default' {
  if (!status) {
    return 'default';
  }

  if (status === 'approved' || status === 'paid' || status === 'completed') {
    return 'success';
  }

  if (status === 'pending' || status === 'in_process') {
    return 'signal';
  }

  return 'default';
}

function getPaymentBadgeLabel(status?: string | null): string {
  if (!status) {
    return 'Sin pagos';
  }

  if (status === 'approved' || status === 'paid' || status === 'completed') {
    return 'Aprobado';
  }

  if (status === 'pending' || status === 'in_process') {
    return 'Pendiente';
  }

  return 'Registrado';
}

export default function HomePage() {
  const navigate = useNavigate();
  const { authReady, getUserProjects, isAuthenticated, user } = useApp();
  const projects = getUserProjects();
  const primaryProject = projects[0] ?? null;
  const { period } = usePulsePeriod();
  const { projectId, domain, ga4PropertyId, loading: projectLoading, projectsReady } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);
  const { latestPayment, openTickets, paymentsCount, remainingTasks, secondaryLoading, ticketsCount } =
    useHomeOverviewCards(user, primaryProject);

  usePulseRealtime(projectId);

  const projectHydrating = isAuthenticated && authReady && !projectsReady;
  const loading = projectHydrating || projectLoading || isLoading;
  const hasProject = Boolean(projectId);
  const hasDomain = Boolean(domain);
  const canOpenSite = Boolean(domain);
  const projectProgress = Math.max(0, Math.min(primaryProject?.completion_percentage ?? primaryProject?.progress ?? 0, 100));
  const projectSummary = !hasProject
    ? 'Tu proyecto va a aparecer acá cuando quede asignado en Pulse.'
    : remainingTasks === null
      ? 'Todavía no hay tareas visibles para mostrarte en este módulo.'
      : remainingTasks === 0
        ? 'No hay tareas pendientes por ahora.'
        : `${remainingTasks} ${remainingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
  const paymentSummary = latestPayment
    ? `${latestPayment.description ?? 'Pago registrado'} · ${formatCurrency(latestPayment.amount ?? 0, latestPayment.currency ?? 'ARS')}`
    : 'Todavía no registramos pagos en tu cuenta.';
  const supportSummary =
    ticketsCount > 0
      ? `${openTickets} ${openTickets === 1 ? 'ticket abierto' : 'tickets abiertos'} para revisar con el equipo.`
      : 'Cuando necesites ayuda, vas a poder escribirnos desde acá.';

  return (
    <div className="space-y-6">
      <AnimatedReveal
        className="rounded-[20px] border border-[var(--signal-border)] bg-[var(--bg-surface)] p-5 md:p-7"
        data-tour="home-hero"
        disabled={loading}
        key={`${period}-${loading ? 'loading' : hasDomain && data?.hasData ? 'ready' : 'empty'}`}
      >
        {!hasProject && !loading ? (
          <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} hasProject={false} />
        ) : !hasDomain || !data?.hasData ? (
          <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} />
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
                Este mes
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-data text-[52px] font-light leading-none text-[var(--text-primary)] md:text-[64px]">
                  {loading ? <Skeleton height="64px" rounded="sm" width="180px" /> : data.visits.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">visitas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {loading ? '...' : data.visitsDelta !== null ? `+${data.visitsDelta}% vs periodo anterior` : 'Sin comparativa disponible'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-data text-[52px] font-light leading-none text-[var(--text-primary)] md:text-[64px]">
                  {loading ? <Skeleton height="64px" rounded="sm" width="180px" /> : data.contacts.toLocaleString('es-AR')}
                </div>
                <p className="text-[13px] text-[var(--text-secondary)]">consultas recibidas</p>
                <p className="text-[13px] font-medium text-[var(--success)]">
                  {loading ? '...' : data.contactsDelta !== null ? `+${data.contactsDelta}% vs periodo anterior` : 'Sin comparativa disponible'}
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
                  Ver mi sitio
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
            <Badge variant={hasProject ? getProjectStatusVariant(primaryProject?.status) : 'default'} size="sm">
              {hasProject ? getProjectStatusLabel(primaryProject?.status) : 'Sin proyecto'}
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Mi Proyecto</h3>
          <div className="mt-4 h-2 rounded-full bg-[var(--bg-subtle)]">
            <div className="h-2 rounded-full bg-[var(--signal)]" style={{ width: `${projectProgress}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{projectSummary}</p>
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
            <Badge size="sm" variant={getPaymentBadgeVariant(latestPayment?.status)}>
              {secondaryLoading ? 'Cargando' : getPaymentBadgeLabel(latestPayment?.status)}
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Pagos</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{secondaryLoading ? 'Cargando pagos...' : paymentSummary}</p>
          <p className="mt-4 text-sm text-[var(--success)]">{paymentsCount > 0 ? 'Ver pagos →' : 'Ir a pagos →'}</p>
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
              {secondaryLoading ? 'Cargando' : `${openTickets} ${openTickets === 1 ? 'ticket abierto' : 'tickets abiertos'}`}
            </Badge>
          </div>
          <h3 className="mt-4 text-base font-medium text-[var(--text-primary)]">Soporte</h3>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{secondaryLoading ? 'Cargando soporte...' : supportSummary}</p>
          <p className="mt-4 text-sm text-[var(--signal)]">Abrir ticket →</p>
        </button>
      </AnimatedList>
    </div>
  );
}
