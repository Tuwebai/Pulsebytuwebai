import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminUserCard } from '@/features/admin/users/components/AdminUserCard';
import { AdminUsersHeader } from '@/features/admin/users/components/AdminUsersHeader';
import {
  countAdminUsersByFilter,
  filterAdminUsers,
  getAdminUsersFilterLabel,
  type AdminUsersFilterId,
} from '@/features/admin/users/constants/adminUsersFilters';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminUsersScreenProps {
  loading: boolean;
  users: AdminManagedUser[];
  activeFilter: AdminUsersFilterId;
  enablingPulseUserId: string | null;
  reviewingDeletionUserId: string | null;
  onFilterChange: (filterId: AdminUsersFilterId) => void;
  onRefresh: () => void;
  onAddUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
  onReviewAccountDeletion: (
    user: AdminManagedUser,
    decision: 'approve' | 'deny',
    note?: string,
  ) => void;
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
  activeFilter,
  enablingPulseUserId,
  reviewingDeletionUserId,
  onFilterChange,
  onRefresh,
  onAddUser,
  onRoleChange,
  onPulseAccessAction,
  onReviewAccountDeletion,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUsersScreenProps) {
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const clientUsers = users.length - adminUsers;
  const filterCounts = countAdminUsersByFilter(users);
  const visibleUsers = filterAdminUsers(users, activeFilter);

  return (
    <div className="flex h-full flex-col">
      <Card className="flex-1 rounded-2xl border border-border/60 bg-[var(--bg-surface)] shadow-sm">
        <CardContent className="flex-1 p-4 sm:p-5 lg:p-6">
          <AdminUsersHeader
            clientUsers={clientUsers}
            adminUsers={adminUsers}
            activeFilter={activeFilter}
            filterCounts={filterCounts}
            onFilterChange={onFilterChange}
            onAddUser={onAddUser}
            onRefresh={onRefresh}
          />

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
                <div className="text-3xl font-semibold">0</div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Todavía no hay clientes cargados
              </h3>
              <p className="mb-6 text-muted-foreground">
                Los accesos Pulse van a aparecer acá cuando la operación tenga usuarios reales.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={onAddUser}
                  className="bg-signal text-white shadow-none hover:bg-signal/90"
                >
                  Crear primer acceso
                </Button>
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  className="border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40 hover:bg-[var(--bg-elevated)]"
                >
                  Reintentar carga
                </Button>
              </div>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-muted-foreground">
                <div className="text-3xl font-semibold">0</div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No encontramos resultados para {getAdminUsersFilterLabel(activeFilter).toLowerCase()}
              </h3>
              <p className="mb-6 text-muted-foreground">
                Ajustá el filtro o actualizá la operación para revisar nuevos movimientos del panel.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  className="border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40 hover:bg-[var(--bg-elevated)]"
                >
                  Reintentar carga
                </Button>
                {activeFilter !== 'all' ? (
                  <Button
                    onClick={() => onFilterChange('all')}
                    className="bg-signal text-white shadow-none hover:bg-signal/90"
                  >
                    Ver todos los usuarios
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleUsers.map((user) => (
                <AdminUserCard
                  key={user.id}
                  user={user}
                  enablingPulseUserId={enablingPulseUserId}
                  reviewingDeletionUserId={reviewingDeletionUserId}
                  onRoleChange={onRoleChange}
                  onPulseAccessAction={(userId, mode) => {
                    void onPulseAccessAction(userId, mode);
                  }}
                  onEdit={onEdit}
                  onReviewAccountDeletion={onReviewAccountDeletion}
                  onDelete={onDelete}
                  onDomainUpdated={(userId, result) => {
                    onDomainUpdated(userId, result);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
