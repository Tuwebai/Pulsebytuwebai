import { AdminCreateUserDialog } from '@/features/admin/users/components/AdminCreateUserDialog';
import { AdminDeleteUserDialog } from '@/features/admin/users/components/AdminDeleteUserDialog';
import { AdminEditUserDialog } from '@/features/admin/users/components/AdminEditUserDialog';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

interface AdminUsersDialogsProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  createFormData: AdminUserFormData;
  onCreateFormDataChange: (updater: (prev: AdminUserFormData) => AdminUserFormData) => void;
  onCreateSubmit: () => void;
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  editingUser: AdminManagedUser | null;
  onEditingUserChange: (
    updater: (prev: AdminManagedUser | null) => AdminManagedUser | null,
  ) => void;
  onEditSubmit: () => void;
  deleteOpen: boolean;
  userToDelete: AdminManagedUser | null;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}

export function AdminUsersDialogs({
  createOpen,
  onCreateOpenChange,
  createFormData,
  onCreateFormDataChange,
  onCreateSubmit,
  editOpen,
  onEditOpenChange,
  editingUser,
  onEditingUserChange,
  onEditSubmit,
  deleteOpen,
  userToDelete,
  onDeleteClose,
  onDeleteConfirm,
}: AdminUsersDialogsProps) {
  return (
    <>
      <AdminCreateUserDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        formData={createFormData}
        onFormDataChange={onCreateFormDataChange}
        onSubmit={onCreateSubmit}
      />

      <AdminEditUserDialog
        open={editOpen}
        onOpenChange={onEditOpenChange}
        user={editingUser}
        onUserChange={onEditingUserChange}
        onSubmit={onEditSubmit}
      />

      <AdminDeleteUserDialog
        open={deleteOpen}
        user={userToDelete}
        onClose={onDeleteClose}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
