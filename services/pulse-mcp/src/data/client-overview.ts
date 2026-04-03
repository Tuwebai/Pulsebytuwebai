import { type PulsePeriod } from '../date-ranges.js';
import { fetchPulseMetrics } from './metrics.js';
import { fetchNotifications } from './notifications.js';
import { fetchLatestProjectForUser } from './projects.js';
import { fetchSupportTickets } from './support.js';
import { fetchUserById } from './users.js';

export async function fetchClientOverview(userId: string, metricsPeriod: PulsePeriod = 'last_30_days') {
  const user = await fetchUserById(userId);
  const project = await fetchLatestProjectForUser(userId).catch(() => null);
  const [notifications, tickets, metrics] = await Promise.all([
    fetchNotifications(userId, 5, false),
    fetchSupportTickets(userId, 5),
    project ? fetchPulseMetrics(project.id, metricsPeriod) : Promise.resolve(null),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      website: user.website ?? null,
      onboarding_completed: user.onboarding_completed ?? false,
      onboarding_completed_at: user.onboarding_completed_at ?? null,
      pulse_access_status: user.pulse_access_status ?? null,
      pulse_access_granted_at: user.pulse_access_granted_at ?? null,
      pulse_access_disabled_at: user.pulse_access_disabled_at ?? null,
      created_at: user.created_at ?? null,
      updated_at: user.updated_at ?? null,
    },
    project,
    metrics,
    notifications: {
      unreadCount: notifications.unreadCount,
      latest: notifications.notifications.slice(0, 5),
    },
    support: {
      openTickets: tickets.tickets.filter((ticket) => ticket.estado === 'abierto' || ticket.estado === 'open').length,
      latest: tickets.tickets.slice(0, 5),
    },
  };
}
