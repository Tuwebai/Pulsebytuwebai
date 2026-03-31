import { Plus, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ADMIN_USERS_FILTER_IDS,
  getAdminUsersFilterLabel,
  type AdminUsersFilterId,
} from '@/features/admin/users/constants/adminUsersFilters';

interface AdminUsersHeaderProps {
  clientUsers: number;
  adminUsers: number;
  activeFilter: AdminUsersFilterId;
  filterCounts: Record<AdminUsersFilterId, number>;
  onFilterChange: (filterId: AdminUsersFilterId) => void;
  onAddUser: () => void;
  onRefresh: () => void;
}

export function AdminUsersHeader({
  clientUsers,
  adminUsers,
  activeFilter,
  filterCounts,
  onFilterChange,
  onAddUser,
  onRefresh,
}: AdminUsersHeaderProps) {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(59,158,245,0.12),rgba(123,76,212,0.08)_48%,rgba(17,24,39,0.96)_100%)] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400 via-violet-400/70 to-transparent" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Pulse admin · usuarios</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Clientes y accesos</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Ordená accesos Pulse, roles y estados de activación con una vista más clara para la operación.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/[0.05] text-slate-100">
                {clientUsers} clientes activos
              </Badge>
              <Badge variant="outline" className="border-sky-400/20 bg-sky-500/10 text-sky-100">
                {adminUsers} admins
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRefresh} variant="outline" className="border-white/10 bg-slate-950/55 text-slate-100 hover:border-sky-400/25 hover:bg-slate-900">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button onClick={onAddUser} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
              <Plus className="mr-2 h-4 w-4" />
              Agregar usuario
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/90 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vista de trabajo</p>
        <p className="mt-1 text-sm text-slate-300">Filtrá rápido los accesos que necesitan revisión del equipo.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADMIN_USERS_FILTER_IDS.map((filterId) => {
            const isActive = filterId === activeFilter;
            return (
              <button
                key={filterId}
                type="button"
                onClick={() => onFilterChange(filterId)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-sky-400/30 bg-sky-500/10 text-sky-100'
                    : 'border-white/10 bg-[var(--bg-base)] text-slate-300 hover:border-white/15 hover:text-slate-100'
                }`}
              >
                <span>{getAdminUsersFilterLabel(filterId)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-sky-500/15 text-sky-100' : 'bg-white/5 text-slate-400'}`}>
                  {filterCounts[filterId]}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
