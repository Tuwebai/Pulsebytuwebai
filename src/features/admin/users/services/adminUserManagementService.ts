import {
  createAdminUserRecord,
  updateAdminUserRecord,
  updateAdminUserRecordRole,
} from '@/api/admin/adminUsers.api';
import {
  invokeDeleteAdminUser,
  type DeleteAdminUserResponse,
} from '@/api/admin/adminUserDelete.api';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

export async function updateAdminUserRole(userId: string, newRole: string): Promise<void> {
  return updateAdminUserRecordRole(userId, newRole);
}

export async function createAdminUser(newUserData: AdminUserFormData): Promise<AdminManagedUser> {
  return createAdminUserRecord(newUserData);
}

export async function updateAdminUser(editingUser: AdminManagedUser): Promise<void> {
  return updateAdminUserRecord(editingUser);
}

export async function deleteAdminUser(userId: string): Promise<DeleteAdminUserResponse> {
  return invokeDeleteAdminUser(userId);
}
