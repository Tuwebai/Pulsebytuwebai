import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/core/notifications/hooks/useToast';
import { useApp } from '@/contexts/useApp';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { usePulseMetrics } from './usePulseMetrics';
import { usePulsePeriod } from './usePulsePeriod';
import { usePulseBootstrapSync } from './usePulseBootstrapSync';
import { getDaysInRange } from '../services/pulse.service';
import { resolvePulseConnectionState } from './usePulseConnectionState';
import { usePulseRealtime } from './usePulseRealtime';
import { usePulseRealtimeSnapshot } from './usePulseRealtimeSnapshot';
import { usePulseExperienceSettings } from './usePulseExperienceSettings';
import { usePulseExperienceSettingsRealtime } from './usePulseExperienceSettingsRealtime';

function formatRelativeUpdate(updatedAt: string | null): string | null {
  if (!updatedAt) {
    return null;
  }

  const diffMs = Date.now() - new Date(updatedAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return null;
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Actualizado hace menos de un minuto';
  }

  if (diffMinutes < 60) {
    return `Actualizado hace ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `Actualizado hace ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Actualizado hace ${diffDays} d`;
}

function formatRealtimeSample(sampledAt: string | null | undefined): string | null {
  if (!sampledAt) {
    return null;
  }

  const sampledDate = new Date(sampledAt);

  if (Number.isNaN(sampledDate.getTime())) {
    return null;
  }

  return `Muestra tomada ${sampledDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function usePulsePageState() {
  const queryClient = useQueryClient();
  const { authReady, isAuthenticated, user } = useApp();
  const { data: settings, isLoading: settingsLoading } = usePulseExperienceSettings();
  usePulseExperienceSettingsRealtime();
  const { period, setPeriod } = usePulsePeriod(settings?.defaultPeriod ?? 'this_month');
  const { projectId, domain, ga4PropertyId, loading: projectLoading, projectsReady } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);

  const projectHydrating = isAuthenticated ? (authReady ? !projectsReady : false) : false;
  const hasProject = Boolean(projectId);
  const hasGa4 = Boolean(ga4PropertyId);
  const averagePerDay = data?.dailyAverageVisits ?? null;
  const websitePendingReview = user?.website_status === 'pending_review' ? Boolean(user.website) : false;
  const websiteApprovedWithoutData = user?.website_status === 'approved' ? Boolean(user.website) : false;
  const connectionState = resolvePulseConnectionState({
    domain,
    ga4PropertyId,
    hasMetricsData: Boolean(data?.hasData),
    projectId,
    website: user?.website,
    websiteStatus: user?.website_status,
  });
  const shouldAutoSync = projectId ? Boolean(ga4PropertyId) : false;
  const syncDays = Math.min(getDaysInRange(period), 90);
  const manualSyncDays = Math.min(syncDays, 2);
  const { isBootstrapping, refreshPulseData } = usePulseBootstrapSync({
    connectionState,
    manualSyncDays,
    period,
    projectId,
    shouldAutoSync,
    syncDays,
  });

  usePulseRealtime(projectId);

  const canViewMetrics = projectId ? Boolean(ga4PropertyId) : false;
  const { data: realtimeData, isLoading: realtimeLoading, error: realtimeError } = usePulseRealtimeSnapshot(
    projectId,
    canViewMetrics,
  );
  const resolvedDomain = domain ?? user?.website ?? null;
  const loading = projectHydrating || projectLoading || isLoading || settingsLoading;

  return {
    averagePerDay,
    canViewMetrics,
    connectionState,
    data,
    defaultChartMode: settings?.defaultChartMode ?? 'visits',
    domain: resolvedDomain,
    ga4PropertyId,
    hasGa4,
    hasProject,
    isBootstrapping,
    lastUpdatedLabel: formatRelativeUpdate(data?.lastUpdatedAt ?? null),
    loading,
    realtimeData,
    realtimeError: realtimeError instanceof Error ? realtimeError.message : null,
    realtimeLoading,
    realtimeSampleLabel: formatRealtimeSample(realtimeData?.sampledAt),
    settings,
    onRefreshMetrics: async () => {
      try {
        const result = await refreshPulseData('manual');
        await queryClient.invalidateQueries({
          queryKey: ['pulse-realtime', projectId],
          refetchType: 'active',
        });

        if (result) {
          toast({
            title: 'Datos actualizados',
            description: 'Pulse volvió a consultar la actividad reciente de tu web.',
          });
        }
      } catch (error) {
        toast({
          title: 'No pudimos actualizar los datos',
          description: error instanceof Error ? error.message : 'Probá de nuevo en unos minutos.',
          variant: 'destructive',
        });
      }
    },
    onOpenSite: () => {
      if (typeof window !== 'undefined' ? Boolean(resolvedDomain) : false) {
        window.open(`https://${resolvedDomain}`, '_blank', 'noopener,noreferrer');
      }
    },
    period,
    setPeriod,
    websiteApprovedWithoutData,
    websitePendingReview,
  };
}
