import { AlertTriangle } from 'lucide-react';

interface AdminProjectCriticalTasksEmptyStateProps {
  onEditProject: () => void;
}

export function AdminProjectCriticalTasksEmptyState({
  onEditProject,
}: AdminProjectCriticalTasksEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-surface)]/70 p-8">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">No hay tareas críticas activas</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse todavía no detecta tareas bloqueadas, vencidas o sin responsable en este proyecto. Cuando existan
            desvíos reales, van a aparecer acá para lectura rápida del equipo.
          </p>
        </div>
        <button
          type="button"
          onClick={onEditProject}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-white/15 hover:bg-white/[0.06]"
        >
          Volver y editar
        </button>
      </div>
    </section>
  );
}
