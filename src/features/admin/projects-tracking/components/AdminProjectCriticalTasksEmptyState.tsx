import { AlertTriangle } from 'lucide-react';

export function AdminProjectCriticalTasksEmptyState() {
  return (
    <section className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-8 shadow-2xl">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--success)]/20 bg-[var(--success-dim)] text-[var(--success)]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">No hay tareas críticas activas</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Pulse todavía no detecta tareas bloqueadas, vencidas o sin responsable en este proyecto. Cuando existan
            desvíos reales, van a aparecer acá para lectura rápida del equipo.
          </p>
        </div>
      </div>
    </section>
  );
}
