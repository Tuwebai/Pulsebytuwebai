import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import VerDetallesProyecto from '@/components/VerDetallesProyecto';
import { ErrorMessage } from '@/components/ErrorBoundary';
import { SectionSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/lib/supabaseService';
import { ProjectCard, ProjectStatsRow } from '@/features/project/components';
import type { ProjectsPageProject } from '@/features/project/components/projectPage.types';

const ProjectsPage = React.memo(() => {
  const { projects: appProjects, loading, error, refreshData, user } = useApp();
  const projects = appProjects as ProjectsPageProject[];
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectsPageProject | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectCreators, setProjectCreators] = useState<Record<string, { full_name: string; email: string }>>({});
  const [targetUserName, setTargetUserName] = useState<string>('');

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

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        if (!userError && userData) {
          setTargetUserName(userData.full_name || userData.email || 'Usuario');
          return;
        }
      } catch {
        // noop
      }

      setTargetUserName('Usuario');
    };

    void loadTargetUserInfo();
  }, [user, userId]);

  const loadProjectCreators = useCallback(async (projectsToMap: ProjectsPageProject[]) => {
    const uniqueCreatorIds = Array.from(
      new Set(
        projectsToMap
          .map((project) => project.created_by)
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      )
    );

    if (uniqueCreatorIds.length === 0) {
      setProjectCreators({});
      return;
    }

    const creators = await Promise.all(
      uniqueCreatorIds.map(async (creatorId) => {
        try {
          const creator = await userService.getUserById(creatorId);

          if (!creator) {
            return null;
          }

          return [
            creatorId,
            {
              full_name: creator.full_name || creator.email || 'Usuario',
              email: creator.email || 'sin-email@example.com',
            },
          ] as const;
        } catch {
          return [
            creatorId,
            {
              full_name: 'Usuario no disponible',
              email: 'sin-email@example.com',
            },
          ] as const;
        }
      })
    );

    setProjectCreators(
      Object.fromEntries(
        creators.filter(
          (entry): entry is readonly [string, { full_name: string; email: string }] => entry !== null
        )
      )
    );
  }, []);

  useEffect(() => {
    if (!isAdminContext) {
      setProjectCreators({});
      return;
    }

    void loadProjectCreators(visibleProjects);
  }, [isAdminContext, loadProjectCreators, visibleProjects]);

  const handleViewProject = useCallback((project: ProjectsPageProject) => {
    setSelectedProject(project);
    setShowProjectModal(true);
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
          description: 'Solo el dueno o un admin puede borrar este proyecto.',
          variant: 'destructive',
        });
        return;
      }

      setProjectToDelete(projectId);
      setShowDeleteConfirm(true);
    },
    [projects, user]
  );

  const confirmDeleteProject = useCallback(async () => {
    if (!projectToDelete) {
      return;
    }

    try {
      const { error: deleteError } = await supabase.from('projects').delete().eq('id', projectToDelete);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto se elimino correctamente.',
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

  if (loading) {
    return <SectionSpinner />;
  }

  if (error) {
    return <ErrorMessage error={new Error(error)} onRetry={refreshData} />;
  }

  if (!user) {
    return <ErrorMessage error={new Error('Usuario no autenticado')} onRetry={refreshData} />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">
            {userId ? `Proyecto de ${targetUserName || 'cliente'}` : 'Mi Proyecto'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {userId
              ? 'Seguimiento del proyecto asignado a este cliente'
              : 'Segui el estado y el progreso de tu entrega.'}
          </p>
        </div>

        {userId ? (
          <Button
            className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            onClick={() => navigate(-1)}
            type="button"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Volver
          </Button>
        ) : null}
      </section>

      <ProjectStatsRow loading={loading} projects={visibleProjects} />

      {visibleProjects.length === 0 ? (
        <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
            <FolderOpen className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-lg font-medium text-[var(--text-primary)]">Todavia no hay proyecto visible</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tu proyecto aparece aca cuando el equipo lo configura.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              onDeleteProject={handleDeleteProject}
              onNavigateToEdit={(projectId) => navigate(`/proyectos/${projectId}`)}
              onViewProject={handleViewProject}
              project={project}
              projectCreator={project.created_by ? projectCreators[project.created_by] : undefined}
              showAdminActions={isAdminContext}
            />
          ))}
        </section>
      )}

      {showProjectModal && selectedProject ? (
        <VerDetallesProyecto
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
          onUpdate={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
          proyecto={selectedProject}
        />
      ) : null}

      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Eliminar"
        description={`Estas seguro de que queres eliminar el proyecto "${projects.find((project) => project.id === projectToDelete)?.name || 'este proyecto'}"? Esta accion no se puede deshacer.`}
        isOpen={showDeleteConfirm}
        loading={false}
        onClose={cancelDeleteProject}
        onConfirm={confirmDeleteProject}
        title="Confirmar eliminacion"
        variant="destructive"
      />
    </div>
  );
});

ProjectsPage.displayName = 'ProjectsPage';

export default ProjectsPage;
