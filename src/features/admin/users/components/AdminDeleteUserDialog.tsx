import { Trash2 } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
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
    <AdminUserDialogShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      kicker="Pulse admin · usuarios"
      title="Eliminar acceso"
      description={`Vas a eliminar a ${user?.full_name || user?.email || 'este usuario'} del panel operativo.`}
      icon={Trash2}
      iconTone="danger"
      ariaDescribedBy="delete-user-description"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 bg-[var(--bg-elevated)] text-slate-100 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-red-500 text-white hover:bg-red-400">
            Eliminar usuario
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-4">
        <p className="text-sm leading-6 text-slate-200">
          Esta acción borra el acceso operativo y no se puede deshacer. Antes de continuar,
          asegurate de que el cliente ya no necesite seguimiento en Pulse Admin.
        </p>
      </div>
    </AdminUserDialogShell>
  );
}
