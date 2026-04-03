import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

import type { ProjectsPageProject } from '@/features/project/components/projectPage.types';
import {
  deleteProjectById,
  getProjectCreatorMap,
  getTargetUserName,
  type ProjectCreatorInfo,
} from '@/features/project/services/projectOverview.service';

export function useProjectOverview() {
  const { projects: appProjects, loading, error, refreshData, user } = useApp();
  const projects = appProjects as ProjectsPageProject[];
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectsPageProject | null>(null);
  const [projectCreators, setProjectCreators] = useState<Record<string, ProjectCreatorInfo>>({});
  const [targetUserName, setTargetUserName] = useState('');

  const isDashboardProjectRoute = location.pathname.startsWith('/dashboard/proyecto');
  const isAdminContext = user?.role === 'admin' && !isDashboardProjectRoute;

  const visibleProjects = useMemo(() => {
    if (!user) {
      return [];
    }

    if (userId) {
      return projects.filter((project) => project.created_by === userId);
    }

    if (user.role === 'admin' && !isDashboardProjectRoute) {
      return projects;
    }

    return projects.filter((project) => project.created_by === user.id);
  }, [isDashboardProjectRoute, projects, user, userId]);

  useEffect(() => {
    const loadTargetUserInfo = async () => {
      if (!userId || !user || userId === user.id) {
        setTargetUserName('');
        return;
      }

      setTargetUserName(await getTargetUserName(userId));
    };

    void loadTargetUserInfo();
  }, [user, userId]);

  useEffect(() => {
    const loadProjectCreators = async () => {
      if (!isAdminContext) {
        setProjectCreators({});
        return;
      }

      const creatorIds = Array.from(
        new Set(
          visibleProjects
            .map((project) => project.created_by)
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
        ),
      );

      if (creatorIds.length === 0) {
        setProjectCreators({});
        return;
      }

      setProjectCreators(await getProjectCreatorMap(creatorIds));
    };

    void loadProjectCreators();
  }, [isAdminContext, visibleProjects]);

  const handleViewProject = useCallback((project: ProjectsPageProject) => {
    setSelectedProject(project);
  }, []);

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      if (!user) {
        return;
      }

      const project = projects.find((projectItem) => projectItem.id === projectId);
      if (!project) {
        return;
      }

      if (user.role !== 'admin' && project.created_by !== user.id) {
        toast({
          title: 'Sin permisos',
          description: 'Solo el dueño o un admin puede borrar este proyecto.',
          variant: 'destructive',
        });
        return;
      }

      setProjectToDelete(projectId);
      setShowDeleteConfirm(true);
    },
    [projects, user],
  );

  const confirmDeleteProject = useCallback(async () => {
    if (!projectToDelete) {
      return;
    }

    try {
      await deleteProjectById(projectToDelete);
      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto se eliminó correctamente.',
      });
      await refreshData();
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el proyecto.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    }
  }, [projectToDelete, refreshData]);

  const cancelDeleteProject = useCallback(() => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  }, []);

  return {
    cancelDeleteProject,
    confirmDeleteProject,
    error,
    handleDeleteProject,
    handleViewProject,
    isAdminContext,
    loading,
    navigate,
    projectCreators,
    projectToDelete,
    projects,
    refreshData,
    selectedProject,
    setSelectedProject,
    showDeleteConfirm,
    targetUserName,
    user,
    userId,
    visibleProjects,
  };
}
