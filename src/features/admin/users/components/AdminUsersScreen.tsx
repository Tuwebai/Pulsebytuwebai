import { RefreshCw, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminAddUserCard } from '@/features/admin/components/AdminAddUserCard';
import { AdminUserCard } from '@/features/admin/users/components/AdminUserCard';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminUsersScreenProps {
  loading: boolean;
  users: AdminManagedUser[];
  enablingPulseUserId: string | null;
  onRefresh: () => void;
  onAddUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
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
  onPulseAccessAction,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUsersScreenProps) {
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const clientUsers = users.length - adminUsers;

  return (
    <div className="flex h-full flex-col">
      <Card className="flex-1 rounded-2xl border border-border/60 bg-[var(--bg-surface)] shadow-sm">
        <CardContent className="flex-1 p-4 sm:p-5 lg:p-6">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal/15 text-signal sm:h-11 sm:w-11">
                  <Users size={20} className="sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Clientes y accesos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Revisa accesos Pulse, roles y estado operativo de cada cliente.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline" className="border-border/60 bg-background/40 text-foreground">
                      {clientUsers} clientes
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                      {adminUsers} admins
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex w-full sm:w-auto">
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                  className="w-full border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40 hover:bg-[var(--bg-elevated)] sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-signal" />
              <p className="text-lg font-medium text-foreground">Cargando clientes y accesos...</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Trayendo el estado operativo del panel admin.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-muted-foreground">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Todavia no hay clientes cargados
              </h3>
              <p className="mb-6 text-muted-foreground">
                Los accesos Pulse van a aparecer aca cuando la operacion tenga usuarios reales.
              </p>
              <Button
                onClick={onRefresh}
                variant="outline"
                className="border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40 hover:bg-[var(--bg-elevated)]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar carga
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <AdminUserCard
                  key={user.id}
                  user={user}
                  enablingPulseUserId={enablingPulseUserId}
                  onRoleChange={onRoleChange}
                  onPulseAccessAction={(userId, mode) => {
                    void onPulseAccessAction(userId, mode);
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
