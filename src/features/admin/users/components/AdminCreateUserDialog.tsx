import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminUserFormData } from '@/features/admin/users/types/adminUser';

interface AdminCreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AdminUserFormData;
  onFormDataChange: (updater: (prev: AdminUserFormData) => AdminUserFormData) => void;
  onSubmit: () => void;
}

export function AdminCreateUserDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
}: AdminCreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative border-slate-200 bg-white" aria-describedby="add-user-description">
        {/* Botón X para cerrar */}
        <button
          onClick={() => onOpenChange(false)}
          className="group absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors duration-200 hover:bg-slate-200"
        >
          <span className="text-lg font-semibold text-slate-600 group-hover:text-card-foreground">×</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl text-card-foreground">Agregar Nuevo Usuario</DialogTitle>
          <DialogDescription id="add-user-description" className="text-slate-600">
            Completa la información del nuevo usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) =>
                onFormDataChange((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="usuario@ejemplo.com"
              className="border-border bg-white text-card-foreground"
            />
          </div>

          <div>
            <Label htmlFor="full_name" className="text-slate-700">Nombre Completo</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(event) =>
                onFormDataChange((prev) => ({ ...prev, full_name: event.target.value }))
              }
              placeholder="Nombre Apellido"
              className="border-border bg-white text-card-foreground"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-slate-700">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                onFormDataChange((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="border-border bg-white text-card-foreground">
                <SelectValue>
                  {formData.role === 'admin' ? '👑 Admin' : '👤 Cliente'}
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
            Crear Usuario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
