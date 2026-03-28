import type { Project } from '@/types/project.types';

import { AdminProjectCardActions } from '@/features/admin/projects/components/AdminProjectCardActions';
import { AdminProjectCardHeader } from '@/features/admin/projects/components/AdminProjectCardHeader';
import { AdminProjectCardMetrics } from '@/features/admin/projects/components/AdminProjectCardMetrics';

interface AdminProjectCardProps {
  project: Project;
  onViewProject: (projectId: string) => void;
  onCollaborate: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onUpdateDevelopmentImage: (projectId: string, imageFile: File) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export function AdminProjectCard({
  project,
  onViewProject,
  onCollaborate,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onUpdateDevelopmentImage,
  onRenameProject,
}: AdminProjectCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-colors duration-150 hover:border-white/15 sm:p-6">
      <div className="space-y-5">
        <AdminProjectCardHeader project={project} />
        <AdminProjectCardMetrics project={project} />
        <AdminProjectCardActions
          project={project}
          onViewProject={onViewProject}
          onCollaborate={onCollaborate}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          onDuplicateProject={onDuplicateProject}
          onUpdateDevelopmentImage={onUpdateDevelopmentImage}
          onRenameProject={onRenameProject}
        />
      </div>
    </article>
  );
}
