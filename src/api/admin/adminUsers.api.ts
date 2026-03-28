import { supabase } from '@/lib/supabase';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';
import { invokeCreateAdminUser } from '@/api/admin/adminUserCreate.api';

function normalizeUserRoleForDb(role: string) {
  return role === 'admin' ? 'admin' : 'user';
}

export async function updateAdminUserRecordRole(userId: string, newRole: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role: normalizeUserRoleForDb(newRole) })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function createAdminUserRecord(newUserData: AdminUserFormData): Promise<AdminManagedUser> {
  return invokeCreateAdminUser(newUserData);
}

export async function updateAdminUserRecord(editingUser: AdminManagedUser): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      email: editingUser.email,
      full_name: editingUser.full_name,
      role: normalizeUserRoleForDb(editingUser.role || 'cliente'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', editingUser.id);

  if (error) {
    throw error;
  }
}
