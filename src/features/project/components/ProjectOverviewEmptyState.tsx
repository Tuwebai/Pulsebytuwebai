import { FolderOpen } from 'lucide-react';

export default function ProjectOverviewEmptyState() {
  return (
    <section
      className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center"
      data-tour="project-list"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
        <FolderOpen className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-lg font-medium text-[var(--text-primary)]">Todavía no hay proyecto visible</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Tu proyecto aparece acá cuando el equipo lo configura.
      </p>
    </section>
  );
}
