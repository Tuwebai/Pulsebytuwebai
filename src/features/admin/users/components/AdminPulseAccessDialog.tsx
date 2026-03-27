import { ArrowRight, Clock3, Mail, ShieldCheck, UserCheck } from 'lucide-react';

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

function getStatusBadgeClass(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'invited':
      return 'border-signal/30 bg-signal/10 text-signal';
    case 'disabled':
      return 'border-red-500/25 bg-red-500/10 text-red-300';
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    default:
      return 'border-border/60 bg-[var(--bg-elevated)] text-muted-foreground';
  }
}

function getActionTitle(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'Acceso operativo vigente';
    case 'invited':
      return 'Invitacion emitida y pendiente de ingreso';
    case 'disabled':
      return 'Acceso detenido';
    case 'pending':
      return 'Cliente listo para habilitar';
    default:
      return 'Cliente sin acceso Pulse';
  }
}

function getActionCopy(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'Si el cliente necesita volver a entrar, podes reenviar el acceso desde este panel.';
    case 'invited':
      return 'El siguiente paso operativo es reenviar el acceso solo si el cliente no encontro el correo inicial.';
    case 'disabled':
      return 'La reactivacion requiere un flujo separado. Este modal solo informa el estado actual.';
    case 'pending':
      return 'Todavia no hay acceso emitido. Desde aca podes dejar la cuenta lista para entrar a Pulse.';
    default:
      return 'Todavia no hay acceso emitido. Desde aca podes habilitar el ingreso inicial a Pulse.';
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
  const primaryActionLabel = hasAccess ? 'Reenviar acceso' : 'Habilitar acceso Pulse';
  const statusLabel = getStatusLabel(user.pulse_access_status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-0 text-[var(--text-primary)] shadow-[var(--shadow-modal)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--gradient-subtle)] px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal/15 text-signal">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  Acceso Pulse
                </p>
                <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
                  Gestionar acceso operativo
                </DialogTitle>
                <DialogDescription className="text-sm text-[var(--text-secondary)]">
                  Revisa el estado de acceso de {user.full_name || user.email || 'este cliente'} y ejecuta la accion correcta sin salir del panel.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getStatusBadgeClass(user.pulse_access_status)}>
                  {statusLabel}
                </Badge>
                <Badge variant="outline" className="border-border/60 bg-background/40 text-foreground">
                  {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-[var(--text-primary)]">{getActionTitle(user.pulse_access_status)}</p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{getStatusCopy(user.pulse_access_status)}</p>
              </div>

              <div className="mt-5 rounded-[var(--radius-lg)] border border-signal/15 bg-signal/5 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  Proximo paso
                </p>
                <div className="mt-2 flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <p className="text-sm leading-6 text-[var(--text-primary)]">{getActionCopy(user.pulse_access_status)}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-signal" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      Correo principal
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-[var(--text-primary)]">{user.email || 'Sin email'}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      Direccion usada para invitar o reenviar acceso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-signal" />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      Ultimo movimiento
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{formatDate(user.pulse_access_granted_at)}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      Ultimo registro de habilitacion o invitacion disponible en Pulse.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
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
                {isBusy ? 'Procesando...' : primaryActionLabel}
              </Button>
            ) : (
              <Button
                onClick={onEnable}
                disabled={isBusy}
                className="bg-signal text-white hover:bg-[var(--signal-dim)]"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isBusy ? 'Procesando...' : primaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
