import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { usePulseMetrics } from './usePulseMetrics';
import { usePulsePeriod } from './usePulsePeriod';
import { usePulseBootstrapSync } from './usePulseBootstrapSync';
import { getDaysInRange } from '../services/pulse.service';
import { resolvePulseConnectionState } from './usePulseConnectionState';
import { usePulseRealtime } from './usePulseRealtime';

export function usePulsePageState() {
  const navigate = useNavigate();
  const { authReady, isAuthenticated, user } = useApp();
  const { period, setPeriod } = usePulsePeriod();
  const { projectId, domain, ga4PropertyId, loading: projectLoading, projectsReady } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);

  const projectHydrating = isAuthenticated && authReady && !projectsReady;
  const hasProject = Boolean(projectId);
  const hasGa4 = Boolean(ga4PropertyId);
  const averagePerDay = data ? Math.round(data.visits / getDaysInRange(period)) : null;
  const websitePendingReview = user?.website_status === 'pending_review' && Boolean(user.website);
  const websiteApprovedWithoutData = user?.website_status === 'approved' && Boolean(user.website);
  const connectionState = resolvePulseConnectionState({
    domain,
    ga4PropertyId,
    hasMetricsData: Boolean(data?.hasData),
    projectId,
    website: user?.website,
      websiteStatus: user?.website_status,
  });
  const shouldAutoSync = Boolean(projectId && ga4PropertyId);
  const syncDays = Math.min(getDaysInRange(period), 90);
  const { isBootstrapping, refreshPulseData } = usePulseBootstrapSync({
    connectionState,
    period,
    projectId,
    shouldAutoSync,
    syncDays,
  });
  usePulseRealtime(projectId);
  const canViewMetrics = Boolean(projectId && ga4PropertyId);
  const resolvedDomain = domain ?? user?.website ?? null;
  const loading = projectHydrating || projectLoading || isLoading;

  return {
    averagePerDay,
    canViewMetrics,
    connectionState,
    data,
    domain: resolvedDomain,
    ga4PropertyId,
    hasGa4,
    hasProject,
    isBootstrapping,
    loading,
    onRefreshMetrics: async () => {
      try {
        const result = await refreshPulseData('manual');
        if (result) {
          toast({
            title: 'Datos actualizados',
            description: 'Pulse volvió a consultar la actividad reciente de tu web.',
          });
        }
      } catch (error) {
        toast({
          title: 'No pudimos actualizar los datos',
          description:
            error instanceof Error ? error.message : 'Probá de nuevo en unos minutos.',
          variant: 'destructive',
        });
      }
    },
    onOpenSettings: () => navigate('/dashboard/configuracion'),
    onOpenSite: () => {
      if (typeof window !== 'undefined' && resolvedDomain) {
        window.open(`https://${resolvedDomain}`, '_blank', 'noopener,noreferrer');
      }
    },
    period,
    setPeriod,
    websiteApprovedWithoutData,
    websitePendingReview,
  };
}
