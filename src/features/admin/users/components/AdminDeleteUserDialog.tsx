import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminDeleteUserDialogProps {
  open: boolean;
  user: AdminManagedUser | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminDeleteUserDialog({
  open,
  user,
  onClose,
  onConfirm,
}: AdminDeleteUserDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar eliminación"
      description={`¿Estás seguro de que quieres eliminar al usuario "${user?.full_name || user?.email}"? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="destructive"
      loading={false}
    />
  );
}
