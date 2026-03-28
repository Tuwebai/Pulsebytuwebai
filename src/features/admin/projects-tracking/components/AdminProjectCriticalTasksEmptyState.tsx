import { AlertTriangle } from 'lucide-react';

export function AdminProjectCriticalTasksEmptyState() {
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
      </div>
    </section>
  );
}
