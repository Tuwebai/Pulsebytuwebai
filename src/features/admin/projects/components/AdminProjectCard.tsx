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
    <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl transition-colors duration-150 hover:border-[var(--border-strong)] sm:p-5">
      <div className="space-y-4">
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
