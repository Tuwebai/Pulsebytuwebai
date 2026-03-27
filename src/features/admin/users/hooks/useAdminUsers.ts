import { useState } from 'react';

import { toast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notificationService';
import { enablePulseAccess } from '@/features/admin/services/pulseAccessAdminService';
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
  updateAdminUserRole,
} from '@/features/admin/users/services/adminUserManagementService';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

const DEFAULT_NEW_USER_DATA: AdminUserFormData = {
  email: '',
  full_name: '',
  role: 'cliente',
};

export type PulseAccessActionMode = 'enable' | 'manage' | 'resend';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [enablingPulseUserId, setEnablingPulseUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminManagedUser | null>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminManagedUser | null>(null);
  const [newUserData, setNewUserData] = useState<AdminUserFormData>(DEFAULT_NEW_USER_DATA);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateAdminUserRole(userId, newRole);

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)),
      );

      await notificationService.createNotification({
        title: 'Rol de Usuario Actualizado',
        message: `El rol del usuario ha sido cambiado a ${newRole}`,
        type: 'info',
        user_id: userId,
        category: 'user',
      });

      toast({ title: 'Exito', description: 'Rol de usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol del usuario.',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: AdminManagedUser) => {
    setEditingUser({
      ...user,
      role: user.role || 'cliente',
    });
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: AdminManagedUser) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteAdminUser(userToDelete.id);

      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));

      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente.',
      });

      setShowDeleteUserModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario.',
        variant: 'destructive',
      });
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteUserModal(false);
    setUserToDelete(null);
  };

  const handleCreateUser = async () => {
    try {
      const createdUser = await createAdminUser(newUserData);

      setUsers((prev) => [createdUser, ...prev]);
      setNewUserData(DEFAULT_NEW_USER_DATA);
      setShowAddUserModal(false);

      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado correctamente.',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el usuario.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateAdminUser(editingUser);

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? editingUser : user)),
      );

      setShowEditUserModal(false);
      setEditingUser(null);

      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario.',
        variant: 'destructive',
      });
    }
  };

  const handleEnablePulseAccess = async (
    targetUserId: string,
    mode: PulseAccessActionMode = 'enable',
  ) => {
    try {
      setEnablingPulseUserId(targetUserId);

      const result = await enablePulseAccess(
        targetUserId,
        mode === 'resend' ? 'resend' : 'enable',
      );

      setUsers((prev) =>
        prev.map((currentUser) =>
          currentUser.id === targetUserId
            ? {
                ...currentUser,
                pulse_access_status: result.pulse_access_status,
                pulse_access_granted_at: result.pulse_access_granted_at,
                pulse_access_granted_by: result.pulse_access_granted_by,
                updated_at: new Date().toISOString(),
              }
            : currentUser,
        ),
      );

      if (mode === 'resend') {
        const resendDescription =
          result.delivery_type === 'invite'
            ? 'Se envió una nueva invitación Pulse con branding TuWebAI.'
            : result.delivery_type === 'magiclink'
              ? 'Se envió un nuevo enlace de acceso directo a Pulse.'
              : 'El acceso Pulse del cliente sigue vigente. Si todavía no llegó el correo, revisá la configuración SMTP de Supabase Auth.';

        toast({
          title: 'Acceso reenviado',
          description: resendDescription,
        });
      } else if (mode === 'manage') {
        toast({
          title: 'Acceso Pulse al dia',
          description:
            result.pulse_access_status === 'active'
              ? 'El cliente ya tiene acceso activo a Pulse.'
              : 'El cliente ya tiene una invitación vigente para entrar a Pulse.',
        });
      } else {
        toast({
          title: 'Acceso a Pulse habilitado',
          description:
            result.pulse_access_status === 'active'
              ? 'El cliente ya tiene acceso activo a Pulse.'
              : 'El cliente ya puede entrar a Pulse. Si todavía no completa onboarding, va a onboarding.',
        });
      }
    } catch (error) {
      console.error('Error enabling Pulse access:', error);
      const message =
        error instanceof Error
          ? error.message
          : mode === 'resend'
            ? 'No se pudo reenviar el acceso a Pulse.'
            : mode === 'manage'
              ? 'No se pudo revisar el acceso a Pulse.'
              : 'No se pudo habilitar el acceso a Pulse.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setEnablingPulseUserId(null);
    }
  };

  return {
    users,
    setUsers,
    showAddUserModal,
    setShowAddUserModal,
    showEditUserModal,
    setShowEditUserModal,
    enablingPulseUserId,
    editingUser,
    setEditingUser,
    showDeleteUserModal,
    userToDelete,
    newUserData,
    setNewUserData,
    updateUserRole,
    handleEditUser,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    handleCreateUser,
    handleUpdateUser,
    handleEnablePulseAccess,
  };
}
