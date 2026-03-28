import type { Project } from '@/types/project.types';

interface AdminProjectDetailsPhasesProps {
  project: Project;
}

function getPhaseBadgeClasses(status: string) {
  switch (status) {
    case 'Terminado':
      return 'border-emerald-400/20 bg-emerald-500/12 text-emerald-300';
    case 'En Progreso':
      return 'border-signal/20 bg-signal/12 text-signal';
    case 'Pendiente':
    default:
      return 'border-white/10 bg-white/[0.04] text-[var(--text-secondary)]';
  }
}

export function AdminProjectDetailsPhases({ project }: AdminProjectDetailsPhasesProps) {
  const phases = project.fases ?? [];

  if (phases.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fases operativas</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Este proyecto todavía no tiene fases cargadas en la base operativa.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fases operativas</h3>
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{phases.length} registradas</span>
      </div>

      <div className="mt-4 space-y-3">
        {phases.map((phase) => (
          <article key={phase.key} className="rounded-2xl border border-white/10 bg-[var(--bg-surface)]/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{phase.key}</p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {phase.descripcion || 'Sin descripción operativa cargada'}
                </p>
              </div>

              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPhaseBadgeClasses(phase.estado)}`}>
                {phase.estado}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
