import { Button } from '@/core/ui/button';
import { AdminPageActionsBar } from '@/features/admin/components/AdminPageActionsBar';
import { AdminUserCard } from '@/features/admin/users/components/AdminUserCard';
import { AdminUsersFilters } from '@/features/admin/users/components/AdminUsersFilters';
import { AdminUsersStats } from '@/features/admin/users/components/AdminUsersStats';
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
      project_ga4_property_id?: string | null;
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
    <div className="space-y-6 text-slate-100">
      <AdminPageActionsBar
        actions={(
          <Button onClick={onAddUser} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
            Agregar usuario
          </Button>
        )}
      >
        <AdminUsersFilters
          activeFilter={activeFilter}
          filterCounts={filterCounts}
          onFilterChange={onFilterChange}
        />
      </AdminPageActionsBar>

      <AdminUsersStats clientUsers={clientUsers} adminUsers={adminUsers} filterCounts={filterCounts} />

      {loading ? (
        <section className="rounded-[28px] border border-white/10 bg-[var(--bg-surface)]/90 px-6 py-16 text-center shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
          <p className="text-sm text-slate-400">Cargando clientes y accesos...</p>
        </section>
      ) : users.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.86))] px-6 py-16 text-center shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
          <h2 className="text-xl font-semibold text-slate-50">Todavía no hay usuarios cargados</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Los accesos Pulse van a aparecer acá cuando la operación tenga usuarios reales.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onAddUser} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
              Crear primer acceso
            </Button>
            <Button onClick={onRefresh} variant="outline" className="border-white/10 bg-transparent text-slate-200 hover:bg-slate-900">
              Reintentar carga
            </Button>
          </div>
        </section>
      ) : visibleUsers.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.86))] px-6 py-16 text-center shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
          <h2 className="text-xl font-semibold text-slate-50">
            No encontramos resultados para {getAdminUsersFilterLabel(activeFilter).toLowerCase()}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Ajustá el filtro o actualizá la operación para revisar nuevos movimientos del panel.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onRefresh} variant="outline" className="border-white/10 bg-transparent text-slate-200 hover:bg-slate-900">
              Reintentar carga
            </Button>
            {activeFilter !== 'all' ? (
              <Button onClick={() => onFilterChange('all')} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
                Ver todos los usuarios
              </Button>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-surface)]/92 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bandeja activa</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-50">Usuarios visibles ({visibleUsers.length})</h2>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
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
        </section>
      )}
    </div>
  );
}
