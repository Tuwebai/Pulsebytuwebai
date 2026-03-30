import {
  fetchAdminAccountDeletionRequests,
  fetchAdminPayments,
  fetchAdminProjects,
  fetchAdminTickets,
  fetchAdminTicketUsers,
  fetchAdminUsers,
  type AdminAccountDeletionRequestRecord,
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

function buildDeletionRequestMap(requests: AdminAccountDeletionRequestRecord[]) {
  return new Map(requests.map((request) => [request.user_id, request]));
}

function buildLatestProjectMap(projects: AdminProjectRecord[]) {
  const latestProjectsByUser = new Map<string, AdminProjectRecord>();

  projects.forEach((project) => {
    if (!project.created_by || latestProjectsByUser.has(project.created_by)) {
      return;
    }

    latestProjectsByUser.set(project.created_by, project);
  });

  return latestProjectsByUser;
}

function transformUsers(
  users: AdminUserRecord[],
  projects: AdminProjectRecord[],
  requests: AdminAccountDeletionRequestRecord[],
): AdminUserRecord[] {
  const requestsMap = buildDeletionRequestMap(
    requests.filter((request): request is AdminAccountDeletionRequestRecord & { user_id: string } => Boolean(request.user_id)),
  );
  const latestProjectsMap = buildLatestProjectMap(
    projects.filter((project): project is AdminProjectRecord & { created_by: string } => Boolean(project.created_by)),
  );

  return users.map((user) => {
    const request = requestsMap.get(user.id);
    const latestProject = latestProjectsMap.get(user.id);

    if (!request && !latestProject) {
      return user;
    }

    return {
      ...user,
      project_ga4_property_id: latestProject?.ga4_property_id ?? null,
      account_deletion_request_id: request?.id ?? null,
      account_deletion_requested_at: request?.created_at ?? null,
      account_deletion_reason: request?.mensaje ?? null,
    };
  });
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
  const [users, projects, rawTickets, payments, deletionRequests] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminProjects(),
    fetchAdminTickets(),
    fetchAdminPayments(),
    fetchAdminAccountDeletionRequests(),
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
    users: transformUsers(users, projects, deletionRequests),
    projects,
    tickets: transformTickets(rawTickets, ticketUsers),
    payments,
  };
}
