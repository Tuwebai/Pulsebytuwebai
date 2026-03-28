import { Mail, ShieldCheck, UserPlus, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    help: 'Acceso operativo a Pulse y seguimiento del dominio.',
    icon: Users,
  },
  admin: {
    label: 'Administrador',
    help: 'Gestiona clientes, accesos y operacion interna del panel.',
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
  const SelectedRoleIcon = selectedRole.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border border-white/10 bg-[var(--bg-surface)] p-0 text-foreground shadow-2xl sm:max-w-2xl"
        aria-describedby="create-user-description"
      >
        <div className="border-b border-white/10 bg-[var(--bg-surface)] px-5 py-5 sm:px-6">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-signal/20 bg-signal/15 text-signal hover:bg-signal/15">
                      Nuevo acceso
                    </Badge>
                    <Badge className="border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.06]">
                      Pulse Admin
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">
                      Crear cliente o acceso operativo
                    </DialogTitle>
                    <DialogDescription
                      id="create-user-description"
                      className="max-w-xl text-sm leading-6 text-muted-foreground"
                    >
                      Registramos el perfil base del usuario para poder gestionar dominio,
                      acceso Pulse y seguimiento operativo desde el panel.
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
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
                className="h-11 border-white/10 bg-[var(--bg-elevated)] text-foreground placeholder:text-muted-foreground focus-visible:ring-signal"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Se usa para acceso, notificaciones y seguimiento operativo.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="create-user-full-name"
                className="text-sm font-medium text-slate-200"
              >
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
                className="h-11 border-white/10 bg-[var(--bg-elevated)] text-foreground placeholder:text-muted-foreground focus-visible:ring-signal"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Es el nombre que va a ver el equipo en cards, tickets y accesos.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
              <div className="space-y-2">
                <Label htmlFor="create-user-role" className="text-sm font-medium text-slate-200">
                  Rol operativo
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    onFormDataChange((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger
                    id="create-user-role"
                    className="h-11 border-white/10 bg-[var(--bg-base)] text-foreground focus:ring-signal"
                  >
                    <SelectValue placeholder="Elegir rol" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-foreground">
                    <SelectItem
                      value="cliente"
                      className="focus:bg-white/10 focus:text-foreground"
                    >
                      Cliente
                    </SelectItem>
                    <SelectItem
                      value="admin"
                      className="focus:bg-white/10 focus:text-foreground"
                    >
                      Administrador
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs leading-5 text-muted-foreground">
                  El rol define alcance operativo, no el acceso Pulse final.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal/15 text-signal">
                    <SelectedRoleIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{selectedRole.label}</p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {selectedRole.help}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                <Mail className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Resultado esperado</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Creamos el perfil operativo en el panel. El acceso a Pulse y la URL se gestionan
                  despues segun el caso del cliente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-[var(--bg-elevated)] text-foreground hover:border-white/15 hover:bg-[var(--bg-elevated)]"
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="bg-signal text-white hover:bg-signal/90">
            Crear registro operativo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
