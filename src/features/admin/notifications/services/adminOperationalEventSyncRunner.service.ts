import {
  createManagedOperationalEvent,
  deleteManagedOperationalEvents,
  type ManagedOperationalEventRecord,
  type ManagedOperationalEventUpsertInput,
  updateManagedOperationalEvent,
} from '@/api/admin/operationalEventSources.api';
import { buildEventKey } from './adminOperationalEventSync.utils';

export async function applyManagedOperationalEvents(
  desiredEvents: ManagedOperationalEventUpsertInput[],
  existingEvents: ManagedOperationalEventRecord[],
): Promise<void> {
  const existingByKey = new Map(existingEvents.map((event) => [buildEventKey(event), event]));
  const desiredByKey = new Map(desiredEvents.map((event) => [buildEventKey(event), event]));

  for (const [key, desiredEvent] of desiredByKey) {
    const existingEvent = existingByKey.get(key);

    if (!existingEvent) {
      await createManagedOperationalEvent(desiredEvent);
      continue;
    }

    await updateManagedOperationalEvent(existingEvent.id, {
      ...desiredEvent,
      owner_id: existingEvent.owner_id ?? desiredEvent.owner_id,
      status: desiredEvent.status,
      snoozed_until: existingEvent.status === 'snoozed' ? existingEvent.snoozed_until : null,
      resolved_at: desiredEvent.status === 'resolved' ? new Date().toISOString() : null,
    });
  }

  const staleIds = existingEvents
    .filter((event) => !desiredByKey.has(buildEventKey(event)))
    .map((event) => event.id);

  await deleteManagedOperationalEvents(staleIds);
}
