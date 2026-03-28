import { Plus, RefreshCw, Users } from 'lucide-react';

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
              <Badge variant="outline" className="border-white/10 bg-white/[0.06] text-slate-100">
                {clientUsers} clientes
              </Badge>
              <Badge variant="outline" className="border-amber-400/30 bg-amber-500/15 text-amber-100">
                {adminUsers} admins
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            onClick={onAddUser}
            size="sm"
            className="w-full bg-signal text-white shadow-none hover:bg-signal/90 sm:w-auto"
          >
            <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Agregar cliente
          </Button>
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

      <div className="flex flex-wrap gap-2">
        {ADMIN_USERS_FILTER_IDS.map((filterId) => {
          const isActive = filterId === activeFilter;

          return (
            <button
              key={filterId}
              type="button"
              onClick={() => onFilterChange(filterId)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-signal/40 bg-signal/15 text-signal'
                  : 'border-white/10 bg-[var(--bg-elevated)]/70 text-muted-foreground hover:border-white/15 hover:text-foreground'
              }`}
            >
              <span>{getAdminUsersFilterLabel(filterId)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? 'bg-signal/20 text-signal' : 'bg-white/5 text-slate-300'
                }`}
              >
                {filterCounts[filterId]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
