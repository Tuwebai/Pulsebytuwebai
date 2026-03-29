import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
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

  const handleApprove = async () => {
    await onApprove();
    setNote('');
    onOpenChange(false);
  };

  const handleDeny = async () => {
    await onDeny(note);
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[var(--danger-dim)] p-2 text-[var(--danger)]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Revisar baja de cuenta</DialogTitle>
              <DialogDescription className="text-[var(--text-secondary)]">
                Confirmá si querés aprobar o rechazar la solicitud de {user.full_name || user.email || 'este cliente'}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Pedido recibido
            </p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">{formatRequestedAt(user.account_deletion_requested_at)}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {user.account_deletion_reason || 'El cliente no dejó un motivo adicional.'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">
              Si rechazás la solicitud, dejale una explicación breve para que vea el próximo paso en su perfil.
            </p>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ejemplo: todavía hay movimientos pendientes en tu cuenta y necesitamos resolverlos antes."
              className="min-h-[120px] border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--border-default)] bg-transparent text-[var(--text-primary)]"
          >
            Cerrar
          </Button>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => void handleDeny()}
            className="border-amber-400/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
          >
            {isBusy ? 'Procesando...' : 'Denegar solicitud'}
          </Button>
          <Button
            disabled={isBusy}
            onClick={() => void handleApprove()}
            className="bg-[var(--danger)] text-white hover:opacity-90"
          >
            {isBusy ? 'Procesando...' : 'Aprobar baja'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
