import { Mail, ShieldCheck, UserPlus, Users } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { Input } from '@/core/ui/input';
import { Label } from '@/core/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/select';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
import { AdminUserRoleSummary } from '@/features/admin/users/components/AdminUserRoleSummary';
import type { AdminUserFormData } from '@/features/admin/users/types/adminUser';

interface AdminCreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AdminUserFormData;
  onFormDataChange: (updater: (prev: AdminUserFormData) => AdminUserFormData) => void;
  onSubmit: () => void;
}

const ROLE_OPTIONS = {
  cliente: {
    label: 'Cliente',
    help: 'Ve Pulse y sigue el estado de su dominio.',
    icon: Users,
  },
  admin: {
    label: 'Administrador',
    help: 'Gestiona clientes y operación interna del panel.',
    icon: ShieldCheck,
  },
} as const;

export function AdminCreateUserDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
}: AdminCreateUserDialogProps) {
  const selectedRole = ROLE_OPTIONS[formData.role === 'admin' ? 'admin' : 'cliente'];

  return (
    <AdminUserDialogShell
      open={open}
      onOpenChange={onOpenChange}
      kicker="Pulse admin · usuarios"
      title="Crear acceso"
      description="Cargá el perfil base para que el equipo pueda gestionar acceso, dominio y seguimiento desde Pulse Admin."
      icon={UserPlus}
      ariaDescribedBy="create-user-description"
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
            Crear acceso
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="create-user-email" className="text-sm font-medium text-slate-200">
            Correo principal
          </Label>
          <Input
            id="create-user-email"
            type="email"
            value={formData.email}
            onChange={(event) =>
              onFormDataChange((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="cliente@tuempresa.com"
            className="h-10 border-white/10 bg-[var(--bg-elevated)] text-slate-100 placeholder:text-slate-500 focus-visible:ring-signal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-user-full-name" className="text-sm font-medium text-slate-200">
            Nombre visible
          </Label>
          <Input
            id="create-user-full-name"
            type="text"
            value={formData.full_name}
            onChange={(event) =>
              onFormDataChange((prev) => ({ ...prev, full_name: event.target.value }))
            }
            placeholder="Nombre y apellido"
            className="h-10 border-white/10 bg-[var(--bg-elevated)] text-slate-100 placeholder:text-slate-500 focus-visible:ring-signal"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-2 rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4">
          <Label htmlFor="create-user-role" className="text-sm font-medium text-slate-200">
            Rol operativo
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value) => onFormDataChange((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger
              id="create-user-role"
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
            Define el alcance en admin. El acceso Pulse se habilita aparte.
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
            <p className="text-sm font-medium text-slate-100">Qué queda listo</p>
            <p className="text-sm leading-6 text-slate-400">
              Se crea el registro operativo para luego configurar acceso Pulse, dominio y soporte.
            </p>
          </div>
        </div>
      </div>
    </AdminUserDialogShell>
  );
}
