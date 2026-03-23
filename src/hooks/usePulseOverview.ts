import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { pulseMetricsService, type PulseOverviewData, type PulsePeriod } from '@/services/pulse/pulseMetricsService';

interface UsePulseOverviewState {
  loading: boolean;
  error: string | null;
  projectId: string | null;
  domain: string | null;
  hasDomain: boolean;
  data: PulseOverviewData | null;
}

export function usePulseOverview(period: PulsePeriod): UsePulseOverviewState {
  const { getUserProjects } = useApp();
  const primaryProject = getUserProjects()[0];
  const [state, setState] = useState<UsePulseOverviewState>({
    loading: Boolean(primaryProject?.id),
    error: null,
    projectId: primaryProject?.id || null,
    domain: primaryProject?.domain || null,
    hasDomain: Boolean(primaryProject?.domain),
    data: null
  });

  useEffect(() => {
    const projectId = primaryProject?.id || null;
    const domain = primaryProject?.domain || null;
    const hasDomain = Boolean(domain);

    if (!projectId) {
      setState({
        loading: false,
        error: null,
        projectId: null,
        domain,
        hasDomain,
        data: null
      });
      return;
    }

    let cancelled = false;

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
      projectId,
      domain,
      hasDomain
    }));

    void pulseMetricsService
      .getOverview(projectId, period)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: null,
          projectId,
          domain,
          hasDomain,
          data
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: 'No pudimos cargar las metricas de Pulse.',
          projectId,
          domain,
          hasDomain,
          data: null
        });
      });

    return () => {
      cancelled = true;
    };
  }, [period, primaryProject?.domain, primaryProject?.id]);

  return state;
}
