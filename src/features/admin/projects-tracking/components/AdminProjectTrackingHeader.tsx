import { ArrowLeft, FolderKanban, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AdminProjectTrackingProject } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTrackingHeaderProps {
  project: AdminProjectTrackingProject;
  onBack: () => void;
  onEditProject: () => void;
}

export function AdminProjectTrackingHeader({
  project,
  onBack,
  onEditProject,
}: AdminProjectTrackingHeaderProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-signal/20 bg-signal/12 text-signal">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Seguimiento operativo
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {project.name}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Fases, tareas críticas, responsables y fechas objetivo desde una sola vista Pulse.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a proyectos
          </Button>
          <Button
            type="button"
            onClick={onEditProject}
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
          >
            <SquarePen className="mr-2 h-4 w-4" />
            Volver y editar
          </Button>
        </div>
      </div>
    </section>
  );
}
