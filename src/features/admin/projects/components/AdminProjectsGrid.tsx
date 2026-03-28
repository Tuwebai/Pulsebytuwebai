import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types/project.types';

interface AdminProjectsGridProps {
  projects: Project[];
  userId?: string | null;
  userRole?: string | null;
  onViewProject: (projectId: string) => void;
  onCollaborate: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onUpdateDevelopmentImage: (projectId: string, imageFile: File) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

const getProjectCardStatus = (status: Project['status']): 'completed' | 'in-progress' =>
  status === 'production' ? 'completed' : 'in-progress';

const getProjectCardPhases = (
  project: Project,
): Array<{
  name: string;
  status: 'Pendiente' | 'Completado' | 'En curso' | 'Revisión';
  description?: string;
}> =>
  (project.fases ?? []).map((fase) => ({
    name: fase.key,
    status: fase.estado === 'Terminado' ? 'Completado' : fase.estado === 'En Progreso' ? 'En curso' : 'Pendiente',
    description: fase.descripcion,
  }));

export function AdminProjectsGrid({
  projects,
  userId,
  userRole,
  onViewProject,
  onCollaborate,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onUpdateDevelopmentImage,
  onRenameProject,
}: AdminProjectsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={{
            id: project.id,
            name: project.name,
            category: project.type || 'Web',
            description: project.description || 'Sin descripcion disponible',
            status: getProjectCardStatus(project.status),
            progress: project.progress || 0,
            screenshotUrl: project.screenshot_url,
            results: {
              satisfaction: project.satisfaction || 0,
              originality: project.originality || 0,
              extras: project.extras || [],
            },
            phases: getProjectCardPhases(project),
          }}
          user={userId ? { id: userId, role: userRole } : undefined}
          onViewProject={() => onViewProject(project.id)}
          onNavigateToCollaboration={() => onCollaborate(project.id)}
          onNavigateToEdit={() => onEditProject(project.id)}
          onDeleteProject={() => onDeleteProject(project.id)}
          onDuplicateProject={() => onDuplicateProject(project)}
          onToggleFavorite={() => {}}
          onArchiveProject={() => {}}
          onUpdateDevelopmentImage={onUpdateDevelopmentImage}
          onRenameProject={onRenameProject}
          showAdminActions={true}
          index={index}
        />
      ))}
    </section>
  );
}
