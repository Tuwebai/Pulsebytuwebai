import type { Project } from '@/types/project.types';

import { AdminProjectCardActions } from '@/features/admin/projects/components/AdminProjectCardActions';
import { AdminProjectCardHeader } from '@/features/admin/projects/components/AdminProjectCardHeader';
import { AdminProjectCardMetrics } from '@/features/admin/projects/components/AdminProjectCardMetrics';

interface AdminProjectCardProps {
  project: Project;
  onOpenTracking: (projectId: string) => void;
  onViewProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminProjectCard({
  project,
  onOpenTracking,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: AdminProjectCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-colors duration-150 hover:border-white/15 sm:p-6">
      <div className="space-y-5">
        <AdminProjectCardHeader project={project} />
        <AdminProjectCardMetrics project={project} />
        <AdminProjectCardActions
          projectId={project.id}
          onOpenTracking={onOpenTracking}
          onViewProject={onViewProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      </div>
    </article>
  );
}
