import { ListTodo, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { AdminProjectCriticalTasksFilters } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksFilters';

interface AdminProjectCriticalTasksHeroProps {
  activeFilter: 'all' | 'blocked' | 'overdue' | 'unassigned';
  items: AdminProjectCriticalTaskItem[];
  onChangeFilter: (filter: 'all' | 'blocked' | 'overdue' | 'unassigned') => void;
  onCreateTask: () => void;
}

export function AdminProjectCriticalTasksHero({
  activeFilter,
  items,
  onChangeFilter,
  onCreateTask,
}: AdminProjectCriticalTasksHeroProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Tareas críticas</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Lectura prioritaria de tareas</h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Acá se concentran los desvíos operativos que hoy necesitan atención del equipo Pulse.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <ListTodo className="h-4 w-4" />
            <span>{items.length} tareas priorizadas</span>
          </div>
          <Button
            type="button"
            onClick={onCreateTask}
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear tarea
          </Button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <AdminProjectCriticalTasksFilters
            activeFilter={activeFilter}
            items={items}
            onChange={onChangeFilter}
          />
        </div>
      ) : null}
    </section>
  );
}
