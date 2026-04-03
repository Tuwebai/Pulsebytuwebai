import type {
  EventCounts,
  EventFilters,
  OperationalEvent,
} from '@/features/admin/notifications/services/adminNotifications.service';

export interface AdminInboxSnapshot {
  counts: EventCounts | undefined;
  events: OperationalEvent[];
}

export function eventMatchesFilters(event: OperationalEvent, filters: EventFilters) {
  if (filters.status?.length && !filters.status.includes(event.status)) {
    return false;
  }

  if (filters.severity?.length && !filters.severity.includes(event.severity)) {
    return false;
  }

  if (filters.source_type?.length && (!event.source_type || !filters.source_type.includes(event.source_type))) {
    return false;
  }

  if (filters.owner_id === 'unassigned' && event.owner_id) {
    return false;
  }

  if (filters.owner_id && filters.owner_id !== 'unassigned' && event.owner_id !== filters.owner_id) {
    return false;
  }

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = [event.title, event.description ?? '', event.client_name, event.client_email]
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

export function updateCountsFromTransition(
  counts: EventCounts | undefined,
  previousEvent: OperationalEvent,
  nextEvent: OperationalEvent,
) {
  if (!counts) {
    return counts;
  }

  const nextCounts = { ...counts };
  const previousWasOpen = previousEvent.status === 'open';
  const nextIsOpen = nextEvent.status === 'open';
  const previousWasInProgress = previousEvent.status === 'in_progress';
  const nextIsInProgress = nextEvent.status === 'in_progress';
  const previousWasCriticalOpen = previousWasOpen && previousEvent.severity === 'critical';
  const nextIsCriticalOpen = nextIsOpen && nextEvent.severity === 'critical';
  const previousWasUnassignedOpen = previousWasOpen && !previousEvent.owner_id;
  const nextIsUnassignedOpen = nextIsOpen && !nextEvent.owner_id;
  const previousResolvedToday = Boolean(previousEvent.resolved_at);
  const nextResolvedToday = Boolean(nextEvent.resolved_at);

  nextCounts.open_total = Math.max(0, nextCounts.open_total + Number(nextIsOpen) - Number(previousWasOpen));
  nextCounts.in_progress = Math.max(
    0,
    nextCounts.in_progress + Number(nextIsInProgress) - Number(previousWasInProgress),
  );
  nextCounts.critical_open = Math.max(
    0,
    nextCounts.critical_open + Number(nextIsCriticalOpen) - Number(previousWasCriticalOpen),
  );
  nextCounts.unassigned = Math.max(
    0,
    nextCounts.unassigned + Number(nextIsUnassignedOpen) - Number(previousWasUnassignedOpen),
  );
  nextCounts.resolved_today = Math.max(
    0,
    nextCounts.resolved_today + Number(nextResolvedToday) - Number(previousResolvedToday),
  );

  return nextCounts;
}
