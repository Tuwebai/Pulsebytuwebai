import type { AdminSectionId } from '@/features/admin/constants/adminSections';
import type { AdminUsersFilterId } from '@/features/admin/users/constants/adminUsersFilters';

export interface AdminSectionNavigationOptions {
  usersFilter?: AdminUsersFilterId;
}

export type AdminSectionChangeHandler = (
  sectionId: AdminSectionId,
  options?: AdminSectionNavigationOptions,
) => void;
