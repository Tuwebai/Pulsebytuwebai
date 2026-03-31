import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminAccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminManagedUser;
  isBusy: boolean;
  onApprove: () => Promise<void>;
  onDeny: (note: string) => Promise<void>;
}

function formatRequestedAt(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Sin fecha'
    : new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function AdminAccountDeletionDialog({
  open,
  onOpenChange,
  user,
  isBusy,
  onApprove,
  onDeny,
}: AdminAccountDeletionDialogProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
    }
  }, [open]);

  const handleApprove = async () => {
    await onApprove();
    onOpenChange(false);
  };

  const handleDeny = async () => {
    await onDeny(note);
    onOpenChange(false);
  };

  return (
    <AdminUserDialogShell
      open={open}
      onOpenChange={onOpenChange}
      kicker="Pulse admin · bajas"
      title="Revisar baja de cuenta"
      description={`Confirmá si querés aprobar o rechazar la solicitud de ${user.full_name || user.email || 'este cliente'}.`}
      icon={AlertTriangle}
      iconTone="warning"
      ariaDescribedBy="account-deletion-description"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-[var(--bg-elevated)] text-slate-100 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
          >
            Cerrar
          </Button>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => void handleDeny()}
            className="border-amber-400/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
          >
            {isBusy ? 'Procesando...' : 'Rechazar solicitud'}
          </Button>
          <Button
            disabled={isBusy}
            onClick={() => void handleApprove()}
            className="bg-red-500 text-white hover:bg-red-400"
          >
            {isBusy ? 'Procesando...' : 'Aprobar baja'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Pedido recibido
        </p>
        <p className="mt-2 text-sm font-medium text-slate-100">
          {formatRequestedAt(user.account_deletion_requested_at)}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {user.account_deletion_reason || 'El cliente no dejó un motivo adicional.'}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-300">
          Si rechazás la solicitud, dejá una explicación breve con el próximo paso.
        </p>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ejemplo: todavía hay movimientos pendientes y necesitamos resolverlos antes."
          className="min-h-[110px] border-white/10 bg-[var(--bg-base)] text-slate-100 placeholder:text-slate-500"
        />
      </div>
    </AdminUserDialogShell>
  );
}
