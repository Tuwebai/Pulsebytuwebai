import {
  fetchManagedOperationalEvents,
  fetchOperationalSourcePayments,
  fetchOperationalSourceProjects,
  fetchOperationalSourceTickets,
  fetchOperationalSourceUsers,
} from '@/api/admin/operationalEventSources.api';
import {
  createProjectApprovalEvents,
  createUserEvents,
} from './adminOperationalEventSync.userProjectBuilders';
import {
  createPaymentEvents,
  createTicketEvents,
} from './adminOperationalEventSync.ticketPaymentBuilders';
import { applyManagedOperationalEvents } from './adminOperationalEventSyncRunner.service';
import { MANAGED_EVENT_TYPES } from './adminOperationalEventSync.types';
import { buildEventKey, buildLatestProjectMap } from './adminOperationalEventSync.utils';

export async function syncOperationalEventsFromSources(): Promise<void> {
  const [users, projects, tickets, payments, existingEvents] = await Promise.all([
    fetchOperationalSourceUsers(),
    fetchOperationalSourceProjects(),
    fetchOperationalSourceTickets(),
    fetchOperationalSourcePayments(),
    fetchManagedOperationalEvents(MANAGED_EVENT_TYPES),
  ]);

  const latestProjectByUser = buildLatestProjectMap(projects);
  const existingByKey = new Map(existingEvents.map((event) => [buildEventKey(event), event]));
  const desiredEvents = [
    ...createUserEvents(users, latestProjectByUser, existingByKey),
    ...createProjectApprovalEvents(projects, existingByKey),
    ...createTicketEvents(tickets, existingByKey),
    ...createPaymentEvents(payments, existingByKey),
  ];

  await applyManagedOperationalEvents(desiredEvents, existingEvents);
}
