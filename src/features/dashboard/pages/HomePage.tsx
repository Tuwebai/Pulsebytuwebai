import { CreditCard, FolderOpen, LifeBuoy, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedList from '@/core/components/AnimatedList';
import { useApp } from '@/contexts/useApp';
import HomeHero from '@/features/dashboard/components/HomeHero';
import HomeShortcutCard from '@/features/dashboard/components/HomeShortcutCard';
import {
  getPaymentBadgeLabel,
  getPaymentBadgeVariant,
  getProjectStatusLabel,
  getProjectStatusVariant,
} from '@/features/dashboard/components/homePage.utils';
import { useHomeOverviewCards } from '@/features/dashboard/hooks/useHomeOverviewCards';
import { getGoogleConnectionCopy, resolveGoogleConnectionState } from '@/features/google/services/googlePage.service';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { resolvePulseConnectionState } from '@/features/pulse/hooks/usePulseConnectionState';
import { usePulseMetrics } from '@/features/pulse/hooks/usePulseMetrics';
import { usePulsePeriod } from '@/features/pulse/hooks/usePulsePeriod';
import { usePulseRealtime } from '@/features/pulse/hooks/usePulseRealtime';
import { formatCurrency } from '@/features/payments/services/mercadoPago';

function buildProjectSummary(hasProject: boolean, connectionState: string, remainingTasks: number | null) {
  if (!hasProject) {
    if (connectionState === 'pending_review') {
      return 'Ya recibimos tu web. La estamos validando para dejar Pulse listo con tus datos reales.';
    }

    if (connectionState === 'approved_pending_connection') {
      return 'Tu dominio ya quedó aprobado. Ahora estamos terminando la conexión para mostrarte movimiento real.';
    }

    return 'Tu espacio Pulse se está preparando. Cuando la conexión esté lista, vas a empezar a ver resultados acá.';
  }

  if (remainingTasks === null) {
    return 'Todavía no hay tareas visibles para mostrarte en este módulo.';
  }

  if (remainingTasks === 0) {
    return 'No hay tareas pendientes por ahora.';
  }

  return `${remainingTasks} ${remainingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
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

  const projectHydrating = isAuthenticated ? (authReady ? !projectsReady : false) : false;
  const loading = projectHydrating || projectLoading || isLoading;
  const hasProject = Boolean(projectId);
  const resolvedDomain = domain ?? user?.website ?? null;
  const connectionState = resolvePulseConnectionState({
    domain,
    ga4PropertyId,
    hasMetricsData: Boolean(data?.hasData),
    projectId,
    website: user?.website,
    websiteStatus: user?.website_status,
  });
  const googleConnectionState = resolveGoogleConnectionState({
    domain,
    website: user?.website,
    websiteStatus: user?.website_status,
  });
  const googleConnectionCopy = getGoogleConnectionCopy(googleConnectionState);

  return (
    <div className="space-y-6">
      <HomeHero
        canOpenSite={Boolean(resolvedDomain)}
        chartData={data?.chartData ?? []}
        consultationRate={data?.consultationRate ?? 0}
        consultationRateDelta={data?.consultationRateDelta ?? 0}
        connectionReady={connectionState === 'connected_with_data'}
        contacts={data?.contacts ?? 0}
        contactsDelta={data?.contactsDelta ?? null}
        dailyAverageVisits={data?.dailyAverageVisits ?? 0}
        dailyAverageVisitsDelta={data?.dailyAverageVisitsDelta ?? 0}
        ga4PropertyId={ga4PropertyId}
        hasProject={hasProject}
        loading={loading}
        onOpenSite={() => {
          if (resolvedDomain) {
            window.open(`https://${resolvedDomain}`, '_blank', 'noopener,noreferrer');
            return;
          }

          navigate('/dashboard/configuracion');
        }}
        visits={data?.visits ?? 0}
        visitsDelta={data?.visitsDelta ?? null}
      />

      <AnimatedList className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" staggerMs={80}>
        <HomeShortcutCard
          badgeLabel={hasProject ? getProjectStatusLabel(primaryProject?.status) : 'Sin proyecto'}
          badgeVariant={hasProject ? getProjectStatusVariant(primaryProject?.status) : 'default'}
          ctaLabel="Ver proyecto →"
          dataTour="home-project-card"
          detail={buildProjectSummary(hasProject, connectionState, remainingTasks)}
          icon={FolderOpen}
          iconClassName="bg-signal/15 text-signal"
          label="Mi Proyecto"
          onClick={() => navigate('/dashboard/proyecto')}
        />

        <HomeShortcutCard
          badgeLabel={googleConnectionCopy.badgeLabel}
          badgeVariant={googleConnectionCopy.badgeVariant}
          ctaLabel="Ver Google →"
          dataTour="home-google-card"
          detail={googleConnectionCopy.description}
          icon={Search}
          iconClassName="bg-amber-500/15 text-amber-300"
          label="Google"
          onClick={() => navigate('/dashboard/google')}
        />

        <HomeShortcutCard
          badgeLabel={secondaryLoading ? 'Cargando' : getPaymentBadgeLabel(latestPayment?.status)}
          badgeVariant={getPaymentBadgeVariant(latestPayment?.status)}
          ctaLabel={paymentsCount > 0 ? 'Ver pagos →' : 'Ir a pagos →'}
          dataTour="home-payments-card"
          detail={
            secondaryLoading
              ? 'Cargando pagos...'
              : latestPayment
                ? `${latestPayment.description ?? 'Pago registrado'} · ${formatCurrency(latestPayment.amount ?? 0, latestPayment.currency ?? 'ARS')}`
                : 'Todavía no registramos pagos en tu cuenta.'
          }
          icon={CreditCard}
          iconClassName="bg-emerald-500/15 text-emerald-300"
          label="Pagos"
          onClick={() => navigate('/dashboard/pagos')}
        />

        <HomeShortcutCard
          badgeLabel={secondaryLoading ? 'Cargando' : `${openTickets} ${openTickets === 1 ? 'ticket abierto' : 'tickets abiertos'}`}
          badgeVariant={openTickets > 0 ? 'signal' : 'default'}
          ctaLabel="Abrir ticket →"
          dataTour="home-support-card"
          detail={
            secondaryLoading
              ? 'Cargando soporte...'
              : ticketsCount > 0
                ? `${openTickets} ${openTickets === 1 ? 'ticket abierto' : 'tickets abiertos'} para revisar con el equipo.`
                : 'Cuando necesites ayuda, vas a poder escribirnos desde acá.'
          }
          icon={LifeBuoy}
          iconClassName="bg-violet-500/15 text-violet-300"
          label="Soporte"
          onClick={() => navigate('/dashboard/soporte')}
        />
      </AnimatedList>
    </div>
  );
}
