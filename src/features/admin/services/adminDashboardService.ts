import {
  fetchAdminPayments,
  fetchAdminProjects,
  fetchAdminTickets,
  fetchAdminTicketUsers,
  fetchAdminUsers,
  type AdminPaymentRecord,
  type AdminProjectRecord,
  type AdminRawTicketRecord,
  type AdminUserRecord,
} from '@/api/admin/adminDashboard.api';

export interface AdminDashboardTicket {
  id: string;
  title: string;
  description: string;
  priority: number | string;
  urgency: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    tier: string;
  };
  category: string;
  tags: string[];
  user_id: string | null;
}

export interface AdminDashboardData {
  users: AdminUserRecord[];
  projects: AdminProjectRecord[];
  tickets: AdminDashboardTicket[];
  payments: AdminPaymentRecord[];
}

function buildTicketUserMap(
  ticketUsers: Awaited<ReturnType<typeof fetchAdminTicketUsers>>,
) {
  return new Map(ticketUsers.map((user) => [user.id, user]));
}

function transformTickets(
  tickets: AdminRawTicketRecord[],
  ticketUsers: Awaited<ReturnType<typeof fetchAdminTicketUsers>>,
): AdminDashboardTicket[] {
  const usersMap = buildTicketUserMap(ticketUsers);

  return tickets.map((ticket) => {
    const relatedUser = ticket.user_id ? usersMap.get(ticket.user_id) : undefined;

    return {
      id: ticket.id,
      title: ticket.title ?? 'Sin título',
      description: ticket.description ?? 'Sin descripción',
      priority: ticket.priority ?? 5,
      urgency: ticket.urgency ?? 'low',
      status: ticket.status ?? 'open',
      createdAt: ticket.created_at,
      customer: relatedUser
        ? {
            name: relatedUser.full_name ?? 'Usuario desconocido',
            email: relatedUser.email ?? '',
            tier: relatedUser.role ?? 'cliente',
          }
        : {
            name: 'Usuario desconocido',
            email: '',
            tier: 'cliente',
          },
      category: ticket.category ?? 'general',
      tags: ticket.tags ?? [],
      user_id: ticket.user_id,
    };
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [users, projects, rawTickets, payments] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminProjects(),
    fetchAdminTickets(),
    fetchAdminPayments(),
  ]);

  const ticketUserIds = [
    ...new Set(
      rawTickets
        .map((ticket) => ticket.user_id)
        .filter((userId): userId is string => Boolean(userId)),
    ),
  ];

  const ticketUsers = await fetchAdminTicketUsers(ticketUserIds);

  return {
    users,
    projects,
    tickets: transformTickets(rawTickets, ticketUsers),
    payments,
  };
}
