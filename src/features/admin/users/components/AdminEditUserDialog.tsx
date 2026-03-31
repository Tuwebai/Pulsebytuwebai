import { Mail, ShieldCheck, SquarePen, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
import { AdminUserRoleSummary } from '@/features/admin/users/components/AdminUserRoleSummary';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminEditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminManagedUser | null;
  onUserChange: (updater: (prev: AdminManagedUser | null) => AdminManagedUser | null) => void;
  onSubmit: () => void;
}

const ROLE_OPTIONS = {
  cliente: {
    label: 'Cliente',
    help: 'Ve Pulse y sigue el estado del proyecto.',
    icon: Users,
  },
  admin: {
    label: 'Administrador',
    help: 'Gestiona clientes y operación del panel.',
    icon: ShieldCheck,
  },
} as const;

export function AdminEditUserDialog({
  open,
  onOpenChange,
  user,
  onUserChange,
  onSubmit,
}: AdminEditUserDialogProps) {
  if (!user) {
    return null;
  }

  const roleValue = user.role === 'admin' ? 'admin' : 'cliente';
  const selectedRole = ROLE_OPTIONS[roleValue];

  return (
    <AdminUserDialogShell
      open={open}
      onOpenChange={onOpenChange}
      kicker="Pulse admin · usuarios"
      title="Editar acceso"
      description="Ajustá correo, nombre y rol para que el equipo vea la información correcta en usuarios, tickets y seguimiento."
      icon={SquarePen}
      ariaDescribedBy="edit-user-description"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-[var(--bg-elevated)] text-slate-100 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="bg-signal text-white hover:bg-signal/90">
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-user-email" className="text-sm font-medium text-slate-200">
            Correo principal
          </Label>
          <Input
            id="edit-user-email"
            type="email"
            value={user.email ?? ''}
            onChange={(event) =>
              onUserChange((prev) => (prev ? { ...prev, email: event.target.value } : null))
            }
            placeholder="cliente@tuempresa.com"
            className="h-10 border-white/10 bg-[var(--bg-elevated)] text-slate-100 placeholder:text-slate-500 focus-visible:ring-signal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-full-name" className="text-sm font-medium text-slate-200">
            Nombre visible
          </Label>
          <Input
            id="edit-user-full-name"
            type="text"
            value={user.full_name ?? ''}
            onChange={(event) =>
              onUserChange((prev) => (prev ? { ...prev, full_name: event.target.value } : null))
            }
            placeholder="Nombre y apellido"
            className="h-10 border-white/10 bg-[var(--bg-elevated)] text-slate-100 placeholder:text-slate-500 focus-visible:ring-signal"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-2 rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4">
          <Label htmlFor="edit-user-role" className="text-sm font-medium text-slate-200">
            Rol operativo
          </Label>
          <Select
            value={roleValue}
            onValueChange={(value) =>
              onUserChange((prev) => (prev ? { ...prev, role: value } : null))
            }
          >
            <SelectTrigger
              id="edit-user-role"
              className="h-10 border-white/10 bg-[var(--bg-base)] text-slate-100 focus:ring-signal"
            >
              <SelectValue placeholder="Elegir rol" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
              <SelectItem value="cliente" className="focus:bg-white/10 focus:text-slate-100">
                Cliente
              </SelectItem>
              <SelectItem value="admin" className="focus:bg-white/10 focus:text-slate-100">
                Administrador
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs leading-5 text-slate-400">
            Cambia el alcance en admin; el acceso Pulse sigue su propio estado.
          </p>
        </div>

        <AdminUserRoleSummary
          icon={selectedRole.icon}
          label={selectedRole.label}
          help={selectedRole.help}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
            <Mail className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-100">Impacto visible</p>
            <p className="text-sm leading-6 text-slate-400">
              Los cambios se reflejan en el listado, en los tickets y en las acciones de acceso del usuario.
            </p>
          </div>
        </div>
      </div>
    </AdminUserDialogShell>
  );
}
