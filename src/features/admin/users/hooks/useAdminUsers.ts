import { useState } from 'react';

import { toast } from '@/core/notifications/hooks/useToast';
import { enablePulseAccess } from '@/features/admin/services/pulseAccessAdminService';
import { createAdminNotification } from '@/features/admin/notifications/services/adminNotificationMutations.service';
import {
  updateAdminUserRole,
} from '@/features/admin/users/services/adminUserManagementService';
import {
  confirmAdminUserDeletion,
  createAdminUserRecord,
  updateAdminUserRecord,
} from '@/features/admin/users/hooks/adminUsers.crud';
import { reviewAdminUserDeletion } from '@/features/admin/users/hooks/adminUsers.deletion';
import {
  getPulseAccessErrorMessage,
  getPulseAccessSuccessToast,
  getRoleUpdatedMessage,
} from '@/features/admin/users/hooks/adminUsers.feedback';
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
  const [reviewingDeletionUserId, setReviewingDeletionUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminManagedUser | null>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminManagedUser | null>(null);
  const [newUserData, setNewUserData] = useState<AdminUserFormData>(DEFAULT_NEW_USER_DATA);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateAdminUserRole(userId, newRole);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));

      await createAdminNotification({
        title: 'Rol de usuario actualizado',
        message: getRoleUpdatedMessage(newRole),
        type: 'info',
        user_id: userId,
        category: 'user',
      });

      toast({ title: 'Éxito', description: 'Rol de usuario actualizado correctamente.' });
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
    setEditingUser({ ...user, role: user.role || 'cliente' });
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: AdminManagedUser) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await confirmAdminUserDeletion(userToDelete.id, setUsers, () => {
        setShowDeleteUserModal(false);
        setUserToDelete(null);
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el usuario.',
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
      await createAdminUserRecord(newUserData, setUsers, () => {
        setNewUserData(DEFAULT_NEW_USER_DATA);
        setShowAddUserModal(false);
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
    if (!editingUser) {
      return;
    }

    try {
      await updateAdminUserRecord(editingUser, setUsers, () => {
        setShowEditUserModal(false);
        setEditingUser(null);
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
      const result = await enablePulseAccess(targetUserId, mode === 'resend' ? 'resend' : 'enable');

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

      toast(getPulseAccessSuccessToast(mode, result));
    } catch (error) {
      console.error('Error enabling Pulse access:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : getPulseAccessErrorMessage(mode),
        variant: 'destructive',
      });
    } finally {
      setEnablingPulseUserId(null);
    }
  };

  const handleReviewAccountDeletion = async (
    user: AdminManagedUser,
    decision: 'approve' | 'deny',
    note?: string,
  ) => {
    try {
      setReviewingDeletionUserId(user.id);
      await reviewAdminUserDeletion(user, decision, setUsers, note);
    } catch (error) {
      toast({
        title: 'No pudimos revisar la solicitud',
        description: error instanceof Error ? error.message : 'Intentá nuevamente en unos minutos.',
        variant: 'destructive',
      });
    } finally {
      setReviewingDeletionUserId(null);
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
    reviewingDeletionUserId,
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
    handleReviewAccountDeletion,
  };
}
