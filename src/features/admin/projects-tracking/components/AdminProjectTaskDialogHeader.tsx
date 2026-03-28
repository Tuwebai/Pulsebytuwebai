import { ListTodo } from 'lucide-react';

interface AdminProjectTaskDialogHeaderProps {
  editing: boolean;
}

export function AdminProjectTaskDialogHeader({ editing }: AdminProjectTaskDialogHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
        <ListTodo className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          Tareas operativas
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {editing ? 'Editar tarea' : 'Nueva tarea'}
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Definí el desvío, el responsable y la fecha objetivo desde una vista operativa Pulse.
        </p>
      </div>
    </div>
  );
}
