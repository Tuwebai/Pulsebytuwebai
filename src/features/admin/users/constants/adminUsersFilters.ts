import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

export const ADMIN_USERS_FILTER_IDS = ['all', 'with-access', 'new-this-month', 'deletion-requests'] as const;

export type AdminUsersFilterId = (typeof ADMIN_USERS_FILTER_IDS)[number];

export function getAdminUsersFilterFromSearchParam(value?: string | null): AdminUsersFilterId {
  return (ADMIN_USERS_FILTER_IDS as readonly string[]).includes(value ?? '')
    ? (value as AdminUsersFilterId)
    : 'all';
}

export function getAdminUsersFilterLabel(filterId: AdminUsersFilterId): string {
  switch (filterId) {
    case 'with-access':
      return 'Clientes con acceso';
    case 'new-this-month':
      return 'Altas del mes';
    case 'deletion-requests':
      return 'Bajas solicitadas';
    default:
      return 'Todos';
  }
}

export function filterAdminUsers(
  users: AdminManagedUser[],
  filterId: AdminUsersFilterId,
  now = new Date(),
): AdminManagedUser[] {
  switch (filterId) {
    case 'with-access':
      return users.filter(
        (user) =>
          user.pulse_access_status === 'invited' || user.pulse_access_status === 'active',
      );
    case 'new-this-month':
      return users.filter((user) => isSameMonth(user.created_at, now));
    case 'deletion-requests':
      return users.filter((user) => Boolean(user.account_deletion_request_id));
    default:
      return users;
  }
}

export function countAdminUsersByFilter(
  users: AdminManagedUser[],
  now = new Date(),
): Record<AdminUsersFilterId, number> {
  return {
    all: users.length,
    'with-access': filterAdminUsers(users, 'with-access', now).length,
    'new-this-month': filterAdminUsers(users, 'new-this-month', now).length,
    'deletion-requests': filterAdminUsers(users, 'deletion-requests', now).length,
  };
}

function isSameMonth(value: string | null | undefined, now: Date): boolean {
  if (!value) {
    return false;
  }

  const createdAt = new Date(value);
  return (
    Number.isFinite(createdAt.getTime()) &&
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth()
  );
}
