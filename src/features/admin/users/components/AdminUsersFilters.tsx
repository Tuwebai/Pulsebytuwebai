import {
  ADMIN_USERS_FILTER_IDS,
  getAdminUsersFilterLabel,
  type AdminUsersFilterId,
} from '@/features/admin/users/constants/adminUsersFilters';

interface AdminUsersFiltersProps {
  activeFilter: AdminUsersFilterId;
  filterCounts: Record<AdminUsersFilterId, number>;
  onFilterChange: (filterId: AdminUsersFilterId) => void;
}

export function AdminUsersFilters({
  activeFilter,
  filterCounts,
  onFilterChange,
}: AdminUsersFiltersProps) {
  return (
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
  );
}
