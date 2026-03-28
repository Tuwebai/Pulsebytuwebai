import { Mail, ShieldCheck, SquarePen, Users } from 'lucide-react';

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
    help: 'Acceso operativo a Pulse y seguimiento del dominio del cliente.',
    icon: Users,
  },
  admin: {
    label: 'Administrador',
    help: 'Gestiona accesos, clientes y operación interna del panel.',
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
  const roleValue = user?.role === 'admin' ? 'admin' : 'cliente';
  const selectedRole = ROLE_OPTIONS[roleValue];
  const SelectedRoleIcon = selectedRole.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border border-white/10 bg-[var(--bg-surface)] p-0 text-foreground shadow-2xl sm:max-w-2xl"
        aria-describedby="edit-user-description"
      >
        <div className="border-b border-white/10 bg-[var(--bg-surface)] px-5 py-5 sm:px-6">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
                <SquarePen className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-signal/20 bg-signal/15 text-signal hover:bg-signal/15">
                    Perfil operativo
                  </Badge>
                  <Badge className="border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.06]">
                    Pulse Admin
                  </Badge>
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">
                    Editar cliente o acceso interno
                  </DialogTitle>
                  <DialogDescription
                    id="edit-user-description"
                    className="max-w-xl text-sm leading-6 text-muted-foreground"
                  >
                    Ajusta correo, nombre visible y rol operativo del registro para que el panel
                    muestre la información correcta en accesos, seguimiento y soporte.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {user ? (
          <>
            <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
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
                      onUserChange((prev) =>
                        prev ? { ...prev, email: event.target.value } : null,
                      )
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
                    htmlFor="edit-user-full-name"
                    className="text-sm font-medium text-slate-200"
                  >
                    Nombre visible
                  </Label>
                  <Input
                    id="edit-user-full-name"
                    type="text"
                    value={user.full_name ?? ''}
                    onChange={(event) =>
                      onUserChange((prev) =>
                        prev ? { ...prev, full_name: event.target.value } : null,
                      )
                    }
                    placeholder="Nombre y apellido"
                    className="h-11 border-white/10 bg-[var(--bg-elevated)] text-foreground placeholder:text-muted-foreground focus-visible:ring-signal"
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Es el nombre que ve el equipo en cards, tickets y acciones del panel.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
                  <div className="space-y-2">
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
                      El rol define el alcance operativo dentro del panel, no el acceso Pulse final.
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
                    <p className="text-sm font-medium text-foreground">Impacto del cambio</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Los ajustes se reflejan en el listado operativo del admin, el seguimiento del
                      cliente y las acciones de acceso vinculadas a este registro.
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
                Guardar cambios operativos
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
