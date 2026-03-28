import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';
import { invokeCreateAdminUser } from '@/api/admin/adminUserCreate.api';
import { invokeUpdateAdminUser } from '@/api/admin/adminUserUpdate.api';

import { supabase } from '@/lib/supabase';

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

async function updateAdminUserRecordFallback(
  editingUser: AdminManagedUser,
): Promise<AdminManagedUser> {
  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from('users')
    .update({
      email: editingUser.email,
      full_name: editingUser.full_name,
      role: normalizeUserRoleForDb(editingUser.role || 'cliente'),
      updated_at: timestamp,
    })
    .eq('id', editingUser.id);

  if (error) {
    throw error;
  }

  return {
    ...editingUser,
    updated_at: timestamp,
  };
}

export async function updateAdminUserRecord(
  editingUser: AdminManagedUser,
): Promise<AdminManagedUser> {
  try {
    return await invokeUpdateAdminUser(editingUser);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('no está desplegada') ||
        error.message.includes('No pudimos conectarnos con la función'))
    ) {
      return updateAdminUserRecordFallback(editingUser);
    }

    throw error;
  }
}
