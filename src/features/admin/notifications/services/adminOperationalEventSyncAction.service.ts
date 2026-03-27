import {
  invokeOperationalEventSync,
  type OperationalEventSyncSummary,
} from '@/api/admin/operationalEventSync.api';

export type { OperationalEventSyncSummary };

export async function syncOperationalEvents(): Promise<OperationalEventSyncSummary> {
  return invokeOperationalEventSync();
}
