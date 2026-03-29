import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AccountDeletionRequestDialogProps {
  isBusy: boolean;
  onSubmit: (reason: string) => Promise<void>;
}

export function AccountDeletionRequestDialog({
  isBusy,
  onSubmit,
}: AccountDeletionRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    await onSubmit(reason);
    setReason('');
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-dim)]"
          type="button"
          variant="outline"
        >
          <Trash2 className="h-4 w-4" />
          Solicitar baja de cuenta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Querés pedir la baja de tu cuenta?</AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--text-secondary)]">
            Vamos a enviar tu solicitud al equipo de TuWebAI para revisarla antes de avanzar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Contanos brevemente por qué querés cerrar tu cuenta. Esto nos ayuda a revisar el pedido correctamente.
          </p>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ejemplo: ya no voy a usar la cuenta o necesito cerrar este acceso."
            className="min-h-[120px] border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--border-default)] bg-transparent text-[var(--text-primary)]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[var(--danger)] text-white hover:opacity-90"
            onClick={() => void handleSubmit()}
          >
            {isBusy ? 'Enviando...' : 'Enviar solicitud'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
