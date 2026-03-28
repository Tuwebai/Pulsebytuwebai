import { supabase } from '@/lib/supabase';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

export async function updateAdminUserRecordRole(userId: string, newRole: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function createAdminUserRecord(newUserData: AdminUserFormData): Promise<AdminManagedUser> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: newUserData.email,
        full_name: newUserData.full_name,
        role: newUserData.role,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AdminManagedUser;
}

export async function updateAdminUserRecord(editingUser: AdminManagedUser): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      email: editingUser.email,
      full_name: editingUser.full_name,
      role: editingUser.role || 'cliente',
      updated_at: new Date().toISOString(),
    })
    .eq('id', editingUser.id);

  if (error) {
    throw error;
  }
}
