import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminEditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminManagedUser | null;
  onUserChange: (updater: (prev: AdminManagedUser | null) => AdminManagedUser | null) => void;
  onSubmit: () => void;
}

export function AdminEditUserDialog({
  open,
  onOpenChange,
  user,
  onUserChange,
  onSubmit,
}: AdminEditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative border-slate-200 bg-white" aria-describedby="edit-user-description">
        {/* Botón X para cerrar */}
        <button
          onClick={() => onOpenChange(false)}
          className="group absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors duration-200 hover:bg-slate-200"
        >
          <span className="text-lg font-semibold text-slate-600 group-hover:text-card-foreground">×</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl text-card-foreground">Editar Usuario</DialogTitle>
          <DialogDescription id="edit-user-description" className="text-slate-600">
            Modifica la información del usuario
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_email" className="text-slate-700">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={user.email ?? ''}
                onChange={(event) =>
                  onUserChange((prev) =>
                    prev ? { ...prev, email: event.target.value } : null,
                  )
                }
                className="border-border bg-white text-card-foreground"
              />
            </div>

            <div>
              <Label htmlFor="edit_full_name" className="text-slate-700">Nombre Completo</Label>
              <Input
                id="edit_full_name"
                type="text"
                value={user.full_name ?? ''}
                onChange={(event) =>
                  onUserChange((prev) =>
                    prev ? { ...prev, full_name: event.target.value } : null,
                  )
                }
                className="border-border bg-white text-card-foreground"
              />
            </div>

            <div>
              <Label htmlFor="edit_role" className="text-slate-700">Rol</Label>
              <Select
                value={user.role || 'cliente'}
                onValueChange={(value) =>
                  onUserChange((prev) => (prev ? { ...prev, role: value } : null))
                }
              >
                <SelectTrigger className="border-border bg-white text-card-foreground">
                  <SelectValue>
                    {user.role === 'admin' ? '👑 Admin' : '👤 Cliente'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente" className="flex items-center space-x-2 text-card-foreground">
                    <span>👤</span>
                    <span>Cliente</span>
                  </SelectItem>
                  <SelectItem value="admin" className="flex items-center space-x-2 text-card-foreground">
                    <span>👑</span>
                    <span>Administrador</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border bg-white px-6 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-muted/50 hover:border-border hover:text-card-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
          >
            Actualizar Usuario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
