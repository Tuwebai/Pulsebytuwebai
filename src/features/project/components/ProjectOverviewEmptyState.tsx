import { FolderOpen } from 'lucide-react';

export default function ProjectOverviewEmptyState() {
  return (
    <section
      className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 px-6 py-12 text-center shadow-[0_18px_40px_rgba(2,6,23,0.24)]"
      data-tour="project-list"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-base)]/70 text-slate-500">
        <FolderOpen className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-lg font-medium text-slate-100">Todavía no hay proyecto visible</h2>
      <p className="mt-2 text-sm text-slate-400">
        Tu proyecto aparece acá cuando el equipo lo configura.
      </p>
    </section>
  );
}
