import { RefreshCw, Users } from 'lucide-react';

import { AdminAddUserCard } from '@/features/admin/components/AdminAddUserCard';
import { AdminUserCard } from '@/features/admin/users/components/AdminUserCard';
import { AdminUsersListHeader } from '@/features/admin/users/components/AdminUsersListHeader';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminUsersScreenProps {
  loading: boolean;
  users: AdminManagedUser[];
  enablingPulseUserId: string | null;
  onRefresh: () => void;
  onAddUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onEnablePulseAccess: (userId: string) => void;
  onEdit: (user: AdminManagedUser) => void;
  onDelete: (user: AdminManagedUser) => void;
  onDomainUpdated: (
    userId: string,
    result: {
      website?: string | null;
      website_status?: string | null;
      website_submitted_at?: string | null;
      website_reviewed_at?: string | null;
      website_reviewed_by?: string | null;
      website_review_notes?: string | null;
    },
  ) => void;
}

export function AdminUsersScreen({
  loading,
  users,
  enablingPulseUserId,
  onRefresh,
  onAddUser,
  onRoleChange,
  onEnablePulseAccess,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUsersScreenProps) {
  return (
    <div className="h-full flex flex-col">
      <Card className="bg-card dark:bg-slate-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 dark:border-slate-700/20 flex-1">
        <CardContent className="p-4 sm:p-6 flex-1">
          <div className="mb-6">
            <div className="mb-4 flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-12 sm:w-12">
                  <Users size={20} className="sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-card-foreground dark:text-slate-100">
                    Gestión de usuarios
                  </span>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Administra usuarios del sistema y sus roles
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800/40 dark:hover:to-teal-800/40 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Actualizar datos
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Cargando usuarios...</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Obteniendo información operativa</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No hay usuarios registrados</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Los clientes y accesos aparecerán aquí cuando la carga operativa traiga datos reales.
              </p>
              <Button
                onClick={onRefresh}
                variant="outline"
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-6 py-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar cargar usuarios
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AdminUsersListHeader
                totalUsers={users.length}
                adminUsers={users.filter((user) => user.role === 'admin').length}
              />

              {users.map((user) => (
                <AdminUserCard
                  key={user.id}
                  user={user}
                  enablingPulseUserId={enablingPulseUserId}
                  onRoleChange={onRoleChange}
                  onEnablePulseAccess={(userId) => {
                    void onEnablePulseAccess(userId);
                  }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDomainUpdated={(userId, result) => {
                    onDomainUpdated(userId, result);
                  }}
                />
              ))}
            </div>
          )}

          <AdminAddUserCard onAddUser={onAddUser} />
        </CardContent>
      </Card>
    </div>
  );
}
