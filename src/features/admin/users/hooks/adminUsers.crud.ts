import type { Dispatch, SetStateAction } from 'react';

import { toast } from '@/core/notifications/hooks/useToast';
import { createAdminUser, deleteAdminUser, updateAdminUser } from '@/features/admin/users/services/adminUserManagementService';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

export async function confirmAdminUserDeletion(
  userId: string,
  setUsers: Dispatch<SetStateAction<AdminManagedUser[]>>,
  closeDialog: () => void,
) {
  const result = await deleteAdminUser(userId);
  setUsers((prev) => prev.filter((user) => user.id !== userId));

  toast({
    title: 'Usuario eliminado',
    description: `El usuario ${result.deleted_email} fue eliminado de la base operativa y de Auth.`,
  });

  closeDialog();
}

export async function createAdminUserRecord(
  formData: AdminUserFormData,
  setUsers: Dispatch<SetStateAction<AdminManagedUser[]>>,
  resetForm: () => void,
) {
  const createdUser = await createAdminUser(formData);
  setUsers((prev) => [createdUser, ...prev]);
  resetForm();

  toast({
    title: 'Usuario creado',
    description: 'El registro operativo quedó creado y el acceso a Pulse queda pendiente hasta habilitarlo.',
  });
}

export async function updateAdminUserRecord(
  user: AdminManagedUser,
  setUsers: Dispatch<SetStateAction<AdminManagedUser[]>>,
  closeDialog: () => void,
) {
  const updatedUser = await updateAdminUser(user);
  setUsers((prev) => prev.map((currentUser) => (currentUser.id === updatedUser.id ? updatedUser : currentUser)));
  closeDialog();

  toast({
    title: 'Usuario actualizado',
    description: 'El usuario ha sido actualizado correctamente.',
  });
}
