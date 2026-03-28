import type { Project } from '@/types/project.types';

import { AdminProjectCard } from '@/features/admin/projects/components/AdminProjectCard';

interface AdminProjectsGridProps {
  projects: Project[];
  onOpenTracking: (projectId: string) => void;
  onViewProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminProjectsGrid({
  projects,
  onOpenTracking,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: AdminProjectsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {projects.map((project) => (
        <AdminProjectCard
          key={project.id}
          project={project}
          onOpenTracking={onOpenTracking}
          onViewProject={onViewProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </section>
  );
}
