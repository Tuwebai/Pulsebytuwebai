import { canReadProject, canReadUser } from '../auth.js';
import { type PulsePeriod, getDateRange } from '../date-ranges.js';
import { fetchDashboardSummary } from './dashboard.js';
import { getCanonicalTicketState } from './support.js';
import { supabase } from './client.js';

export async function fetchOperationalSummary(period: PulsePeriod) {
  const dashboard = await fetchDashboardSummary(period);
  const currentRange = getDateRange(period);

  const [ticketsResult, notificationsResult] = await Promise.all([
    supabase
      .from('tickets')
      .select('id, user_id, estado, status, assigned_admin_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('notifications')
      .select('id, user_id, is_read, is_urgent, created_at')
      .gte('created_at', `${currentRange.from}T00:00:00.000Z`)
      .lte('created_at', `${currentRange.to}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  if (ticketsResult.error) throw ticketsResult.error;
  if (notificationsResult.error) throw notificationsResult.error;

  const tickets = ((ticketsResult.data ?? []) as Array<{
    id: string;
    user_id?: string | null;
    estado?: string | null;
    status?: string | null;
    assigned_admin_id?: string | null;
    updated_at?: string | null;
  }>).filter((ticket) => canReadUser(ticket.user_id));

  const notifications = ((notificationsResult.data ?? []) as Array<{
    id: string;
    user_id?: string | null;
    is_read?: boolean | null;
    is_urgent?: boolean | null;
    created_at?: string | null;
  }>).filter((notification) => canReadUser(notification.user_id));

  const ticketStatusCounts = tickets.reduce<Record<string, number>>((accumulator, ticket) => {
    const status = getCanonicalTicketState({ estado: ticket.estado ?? null, status: ticket.status ?? null }) || 'unknown';
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    period,
    dateRange: currentRange,
    totals: dashboard.totals,
    projects: {
      active_by_status: dashboard.active_projects_by_status,
      total_visible_projects: Object.values(dashboard.active_projects_by_status).reduce((sum, value) => sum + value, 0),
      archived_visible_projects: await countArchivedProjects(),
    },
    tickets: {
      total_visible: tickets.length,
      by_status: ticketStatusCounts,
      assigned: tickets.filter((ticket) => typeof ticket.assigned_admin_id === 'string' && ticket.assigned_admin_id.length > 0).length,
    },
    notifications: {
      total_visible: notifications.length,
      unread: notifications.filter((notification) => notification.is_read === false).length,
      urgent: notifications.filter((notification) => notification.is_urgent === true).length,
    },
  };
}

async function countArchivedProjects() {
  const { data, error } = await supabase.from('projects').select('id, created_by, is_active');

  if (error) throw error;

  return ((data ?? []) as Array<{ id: string; created_by?: string | null; is_active?: boolean | null }>)
    .filter((project) => canReadProject(project.id) && canReadUser(project.created_by) && project.is_active === false)
    .length;
}
