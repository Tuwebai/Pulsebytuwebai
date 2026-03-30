import { fetchPulseRealtimeSnapshot } from '@/api/pulseRealtime.api';

export async function getPulseRealtimeSnapshot(projectId: string) {
  return fetchPulseRealtimeSnapshot(projectId);
}
