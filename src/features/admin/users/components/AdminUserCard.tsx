import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUserDomainReviewDialog } from '@/features/admin/components/AdminUserDomainReviewDialog';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import { Edit, Trash2, UserCheck } from 'lucide-react';

interface AdminUserCardWebsiteUpdate {
  website?: string | null;
  website_status?: string | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
}

interface AdminUserCardProps {
  user: AdminManagedUser;
  enablingPulseUserId: string | null;
  onRoleChange: (userId: string, newRole: string) => void;
  onEnablePulseAccess: (userId: string) => void;
  onEdit: (user: AdminManagedUser) => void;
  onDelete: (user: AdminManagedUser) => void;
  onDomainUpdated: (userId: string, update: AdminUserCardWebsiteUpdate) => void;
}

export function AdminUserCard({
  user,
  enablingPulseUserId,
  onRoleChange,
  onEnablePulseAccess,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUserCardProps) {
  const role = user.role || 'cliente';
  const userInitial = user.full_name?.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <div className="group rounded-2xl border border-border/50 bg-gradient-to-r from-slate-50 to-white p-6 transition-all duration-300 hover:border-border/50 hover:from-slate-100 hover:to-slate-50 hover:shadow-lg dark:border-slate-600/50 dark:from-slate-700 dark:to-slate-600 dark:hover:border-slate-500/50 dark:hover:from-slate-600 dark:hover:to-slate-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.avatar_url ? (
              <div className="h-14 w-14 overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                <img
                  src={user.avatar_url}
                  alt={`Avatar de ${user.full_name || user.email}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white"
                  style={{ display: 'none' }}
                >
                  {userInitial}
                </div>
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                {userInitial}
              </div>
            )}

            {role === 'admin' ? (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-lg font-bold text-card-foreground transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-slate-50">
              {user.full_name || 'Sin nombre'}
            </div>
            <div className="text-sm text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
              {user.email}
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="px-3 py-1 text-xs font-medium">
                  {role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500">ID: {user.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Rol:</span>
            <Select value={role} onValueChange={(value) => onRoleChange(user.id, value)}>
              <SelectTrigger className="w-32 border-border bg-white font-medium text-card-foreground transition-colors duration-200 hover:border-border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-slate-500">
                <SelectValue>{role === 'admin' ? 'Admin' : 'Cliente'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" className="text-card-foreground">
                  Admin
                </SelectItem>
                <SelectItem value="cliente" className="text-card-foreground">
                  Cliente
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {role !== 'admin' ? (
              <Button
                variant="outline"
                size="sm"
                disabled={enablingPulseUserId === user.id}
                onClick={() => onEnablePulseAccess(user.id)}
                className="h-9 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 text-emerald-700 transition-all duration-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800 dark:border-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 dark:hover:from-emerald-800/40 dark:hover:to-teal-800/40 dark:hover:text-emerald-300"
              >
                <UserCheck size={14} className="mr-1" />
                {enablingPulseUserId === user.id ? 'Habilitando...' : 'Permitir acceso a Pulse'}
              </Button>
            ) : null}

            {role !== 'admin' ? (
              <AdminUserDomainReviewDialog
                user={user}
                onUpdated={(result) => {
                  onDomainUpdated(user.id, result);
                }}
              />
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              className="h-9 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 text-blue-700 transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-800 dark:border-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 dark:hover:text-blue-300"
            >
              <Edit size={14} className="mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              className="h-9 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2 text-red-700 transition-all duration-200 hover:from-red-100 hover:to-pink-100 hover:text-red-800 dark:border-red-700 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-400 dark:hover:from-red-800/40 dark:hover:to-pink-800/40 dark:hover:text-red-300"
            >
              <Trash2 size={14} className="mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
