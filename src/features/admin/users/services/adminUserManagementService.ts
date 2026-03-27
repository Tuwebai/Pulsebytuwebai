import {
  createAdminUserRecord,
  deleteAdminUserRecord,
  updateAdminUserRecord,
  updateAdminUserRecordRole,
} from '@/api/admin/adminUsers.api';
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

export async function deleteAdminUser(userId: string): Promise<void> {
  return deleteAdminUserRecord(userId);
}
