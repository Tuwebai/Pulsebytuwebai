import { useQuery } from '@tanstack/react-query';
import type { PulseRealtimeSnapshot } from '@/data/types/pulse';
import { getPulseRealtimeSnapshot } from '../services/pulseRealtime.service';

export function usePulseRealtimeSnapshot(projectId: string | null, enabled: boolean) {
  return useQuery<PulseRealtimeSnapshot>({
    queryKey: ['pulse-realtime', projectId],
    queryFn: () => getPulseRealtimeSnapshot(projectId!),
    enabled: Boolean(projectId) && enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    retry: 1,
  });
}
