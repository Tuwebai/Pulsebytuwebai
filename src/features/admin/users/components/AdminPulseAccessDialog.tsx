import { ArrowRight, Clock3, Mail, ShieldCheck, UserCheck } from 'lucide-react';

import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
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
      return 'Invitación enviada';
    case 'disabled':
      return 'Acceso revocado';
    case 'pending':
      return 'Pendiente de habilitación';
    default:
      return 'Sin acceso';
  }
}

function getStatusCopy(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'El cliente ya puede entrar a Pulse con su acceso vigente.';
    case 'invited':
      return 'Ya enviamos el acceso, pero todavía puede faltar que el cliente entre por primera vez.';
    case 'disabled':
      return 'El acceso quedó detenido y requiere una acción operativa aparte.';
    case 'pending':
      return 'El usuario existe en admin, pero todavía no quedó habilitado para Pulse.';
    default:
      return 'Todavía no emitimos el acceso Pulse para este cliente.';
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
      return 'border-white/10 bg-white/[0.04] text-slate-400';
  }
}

function getActionCopy(status?: AdminManagedUser['pulse_access_status']) {
  switch (status) {
    case 'active':
      return 'Podés reenviar el acceso si el cliente no encuentra el correo.';
    case 'invited':
      return 'Reenviá el acceso solo si el cliente avisa que no recibió el mail.';
    case 'disabled':
      return 'La reactivación se resuelve fuera de este modal.';
    case 'pending':
      return 'Desde acá podés dejar la cuenta lista para entrar a Pulse.';
    default:
      return 'Desde acá podés habilitar el ingreso inicial a Pulse.';
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin registro';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Sin registro'
    : new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
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
    <AdminUserDialogShell
      open={open}
      onOpenChange={onOpenChange}
      kicker="Pulse admin · accesos"
      title="Gestionar acceso Pulse"
      description={`Revisá el estado de ${user.full_name || user.email || 'este cliente'} y ejecutá la acción correcta sin salir del panel.`}
      icon={ShieldCheck}
      ariaDescribedBy="pulse-access-description"
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
            onClick={hasAccess ? onResend : onEnable}
            disabled={isBusy}
            className="bg-signal text-white hover:bg-signal/90"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {isBusy
              ? 'Procesando...'
              : hasAccess
                ? 'Reenviar acceso'
                : 'Habilitar acceso'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={getStatusBadgeClass(user.pulse_access_status)}>
              {getStatusLabel(user.pulse_access_status)}
            </Badge>
            <Badge
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-slate-300"
            >
              {user.role === 'admin' ? 'Administrador' : 'Cliente'}
            </Badge>
          </div>

          <p className="text-sm leading-6 text-slate-300">
            {getStatusCopy(user.pulse_access_status)}
          </p>

          <div className="rounded-2xl border border-signal/15 bg-signal/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <p className="text-sm leading-6 text-slate-100">
                {getActionCopy(user.pulse_access_status)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] px-4 py-3">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-signal" />
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Correo principal
                </p>
                <p className="break-all text-sm font-medium text-slate-100">
                  {user.email || 'Sin email'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] px-4 py-3">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-signal" />
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Último movimiento
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {formatDate(user.pulse_access_granted_at)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminUserDialogShell>
  );
}
