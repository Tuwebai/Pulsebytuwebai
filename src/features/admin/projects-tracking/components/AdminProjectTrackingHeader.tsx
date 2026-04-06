import { FolderKanban, SquarePen } from 'lucide-react';

import { Button } from '@/core/ui/button';
import type { AdminProjectTrackingProject } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTrackingHeaderProps {
  project: AdminProjectTrackingProject;
  onEditProject: () => void;
}

export function AdminProjectTrackingHeader({ project, onEditProject }: AdminProjectTrackingHeaderProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-2xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]">
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
            onClick={onEditProject}
            className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
          >
            <SquarePen className="mr-2 h-4 w-4" />
            Volver y editar
          </Button>
        </div>
      </div>
    </section>
  );
}
