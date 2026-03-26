import type {
  ManagedOperationalEventRecord,
  ManagedOperationalEventUpsertInput,
  OperationalSourceProjectRecord,
} from '@/api/admin/operationalEventSources.api';
import type { OperationalEventStatus } from '@/api/admin/operationalEvents.api';

export function buildEventKey(
  event: Pick<ManagedOperationalEventUpsertInput, 'client_id' | 'type' | 'source_type' | 'source_id'>,
) {
  return [event.client_id, event.type, event.source_type ?? 'none', event.source_id ?? 'none'].join('::');
}

export function buildLatestProjectMap(projects: OperationalSourceProjectRecord[]) {
  const map = new Map<string, OperationalSourceProjectRecord>();

  projects.forEach((project) => {
    if (!project.created_by || map.has(project.created_by)) {
      return;
    }

    map.set(project.created_by, project);
  });

  return map;
}

export function normalizePriority(priority: string | null) {
  return (priority ?? '').toLowerCase();
}

export function normalizeStatus(status: string | null) {
  return (status ?? '').toLowerCase();
}

export function getPersistedStatus(
  existingEvent?: ManagedOperationalEventRecord,
): OperationalEventStatus {
  if (existingEvent?.status === 'in_progress' || existingEvent?.status === 'snoozed') {
    return existingEvent.status;
  }

  return 'open';
}
