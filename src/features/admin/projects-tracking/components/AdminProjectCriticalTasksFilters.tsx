import type {
  AdminProjectCriticalTaskFilter,
  AdminProjectCriticalTaskItem,
} from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { getAdminProjectCriticalTaskFilterCount } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';

interface AdminProjectCriticalTasksFiltersProps {
  activeFilter: AdminProjectCriticalTaskFilter;
  items: AdminProjectCriticalTaskItem[];
  onChange: (filter: AdminProjectCriticalTaskFilter) => void;
}

const filters: Array<{ id: AdminProjectCriticalTaskFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'blocked', label: 'Bloqueadas' },
  { id: 'overdue', label: 'Vencidas' },
  { id: 'unassigned', label: 'Sin responsable' },
];

export function AdminProjectCriticalTasksFilters({
  activeFilter,
  items,
  onChange,
}: AdminProjectCriticalTasksFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const count =
          filter.id === 'all' ? items.length : getAdminProjectCriticalTaskFilterCount(items, filter.id);

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]'
                : 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{filter.label}</span>
            <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--text-primary)]">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
