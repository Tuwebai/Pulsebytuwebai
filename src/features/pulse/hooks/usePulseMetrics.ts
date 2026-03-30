import { useQuery } from '@tanstack/react-query';
import type { Period, PulseMetricsTotals } from '@/data/types/pulse';
import { getPulseMetrics } from '../services/pulse.service';

export function usePulseMetrics(projectId: string | null, period: Period) {
  return useQuery<PulseMetricsTotals>({
    queryKey: ['pulse-metrics', projectId, period],
    queryFn: () => getPulseMetrics(projectId!, period),
    enabled: !!projectId,
    staleTime: 1000 * 60,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2
  });
}
