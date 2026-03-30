import { requestPulseGa4BootstrapSync } from '@/api/pulse/ga4Sync.api';

export async function bootstrapPulseGa4Sync(projectId: string, days: number) {
  return requestPulseGa4BootstrapSync(projectId, days);
}
