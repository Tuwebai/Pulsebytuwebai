import type { Project } from '@/types/project.types';

interface AdminProjectDetailsPhasesProps {
  project: Project;
}

function getPhaseBadgeClasses(status: string) {
  switch (status) {
    case 'Terminado':
      return 'border-[var(--success)]/20 bg-[var(--success-dim)] text-[var(--success)]';
    case 'En Progreso':
      return 'border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]';
    case 'Pendiente':
    default:
      return 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]';
  }
}

export function AdminProjectDetailsPhases({ project }: AdminProjectDetailsPhasesProps) {
  const phases = project.fases ?? [];

  if (phases.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fases operativas</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Este proyecto todavía no tiene fases cargadas en la base operativa.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fases operativas</h3>
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{phases.length} registradas</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {phases.map((phase) => (
          <article key={phase.key} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
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
