import { Clock3, Mail, ShieldCheck, UserCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminPulseAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminManagedUser;
  isBusy: boolean;
  onEnable: () => void;
  onResend: () => void;
}

function getStatusLabel(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'Acceso activo';
    case 'invited':
      return 'Invitacion enviada';
    case 'disabled':
      return 'Acceso revocado';
    case 'pending':
      return 'Pendiente de habilitacion';
    default:
      return 'Sin acceso';
  }
}

function getStatusCopy(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'El cliente ya puede entrar a Pulse con su acceso vigente.';
    case 'invited':
      return 'El cliente ya recibio una invitacion para activar su acceso a Pulse, pero todavia no necesariamente ingreso.';
    case 'disabled':
      return 'El acceso fue revocado y requiere una accion operativa separada.';
    case 'pending':
      return 'El usuario existe en el panel, pero todavia no quedo habilitado para Pulse.';
    default:
      return 'Todavia no enviamos el acceso Pulse para este cliente.';
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin registro';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function AdminPulseAccessDialog({
  open,
  onOpenChange,
  user,
  isBusy,
  onEnable,
  onResend,
}: AdminPulseAccessDialogProps) {
  const hasAccess = user.pulse_access_status === 'invited' || user.pulse_access_status === 'active';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)]">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal/15 text-signal">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
                Gestionar acceso Pulse
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--text-secondary)]">
                Revisa el estado de acceso operativo de {user.full_name || user.email || 'este cliente'}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-signal/30 bg-signal/10 text-signal">
                {getStatusLabel(user.pulse_access_status)}
              </Badge>
              <Badge variant="outline" className="border-border/60 bg-background/40 text-foreground">
                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge>
            </div>

            <p className="mt-3 text-sm text-[var(--text-primary)]">{getStatusCopy(user.pulse_access_status)}</p>

            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-signal" />
                <div>
                  <p className="text-[var(--text-primary)]">{user.email || 'Sin email'}</p>
                  <p>Correo principal para el acceso a Pulse.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 text-signal" />
                <div>
                  <p className="text-[var(--text-primary)]">{formatDate(user.pulse_access_granted_at)}</p>
                  <p>Ultimo registro de habilitacion o invitacion.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-default)] bg-background/30 p-4 text-sm text-[var(--text-secondary)]">
            {hasAccess ? (
              <p>
                Si necesitas volver a notificar al cliente, usa <strong className="text-[var(--text-primary)]">Reenviar acceso</strong>.
                Pulse reenvia el acceso a traves de Supabase Auth y el SMTP configurado para el proyecto, sin depender del frontend.
              </p>
            ) : (
              <p>
                Este cliente todavia no tiene acceso Pulse habilitado. Desde aca podes emitir el acceso inicial y dejarlo listo para onboarding.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40"
            >
              Cerrar
            </Button>

            {hasAccess ? (
              <Button
                onClick={onResend}
                disabled={isBusy}
                className="bg-signal text-white hover:bg-[var(--signal-dim)]"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isBusy ? 'Procesando...' : 'Reenviar acceso'}
              </Button>
            ) : (
              <Button
                onClick={onEnable}
                disabled={isBusy}
                className="bg-signal text-white hover:bg-[var(--signal-dim)]"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isBusy ? 'Procesando...' : 'Habilitar acceso Pulse'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
