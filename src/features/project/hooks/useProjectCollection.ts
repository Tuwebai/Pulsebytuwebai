import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect } from 'react';

import { deleteCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { Project, ProjectLog, User } from '@/contexts/appContext.types';
import { projectService } from '@/features/project/services';
import { supabase } from '@/lib/supabase';

interface UseProjectCollectionParams {
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setLogs: Dispatch<SetStateAction<ProjectLog[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setProjectsReady: Dispatch<SetStateAction<boolean>>;
  user: User | null;
  projects: Project[];
}

async function fetchProjectsForUser(user: User): Promise<Project[]> {
  if (user.role === 'admin') {
    const response = await projectService.getProjects();
    return response.projects;
  }

  return projectService.getProjectsByUser(user.id);
}

export function useProjectCollection({
  setError,
  setLoading,
  setLogs,
  setProjects,
  setProjectsReady,
  user,
  projects,
}: UseProjectCollectionParams) {
  const refreshData = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setProjectsReady(false);
      setProjects(await fetchProjectsForUser(user));
    } catch {
      setError('Error al recargar los datos');
    } finally {
      setProjectsReady(true);
      setLoading(false);
    }
  }, [setError, setLoading, setProjects, setProjectsReady, user]);

  const getUserProjects = useCallback(() => {
    if (!user) {
      return [];
    }

    return user.role === 'admin'
      ? projects
      : projects.filter((project) => project.created_by === user.id);
  }, [projects, user]);

  useEffect(() => {
    if (!user) {
      setProjectsReady(false);
      setProjects([]);
      setLogs([]);
      return;
    }

    const setupProjects = async () => {
      try {
        setLoading(true);
        setProjectsReady(false);
        const projectData = await fetchProjectsForUser(user);
        setProjects(projectData);
        setCachedData(`projects_${user.email}`, projectData, 2 * 60 * 1000);
      } catch {
        setError('Error de conexión');
        setProjects([]);
        setLogs([]);
      } finally {
        setProjectsReady(true);
        setLoading(false);
      }
    };

    void setupProjects();
  }, [setError, setLoading, setLogs, setProjects, setProjectsReady, user]);

  useEffect(() => {
    if (!user || user.role === 'admin') {
      return;
    }

    const channel = supabase
      .channel(`projects-user-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `created_by=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedProject = payload.old as Pick<Project, 'id'>;
            setProjects((current) => current.filter((project) => project.id !== deletedProject.id));
            return;
          }

          const nextProject = payload.new as Project;
          setProjects((current) => {
            const currentIndex = current.findIndex((project) => project.id === nextProject.id);
            if (currentIndex === -1) {
              return [nextProject, ...current];
            }

            return current.map((project) =>
              project.id === nextProject.id ? { ...project, ...nextProject } : project,
            );
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [setProjects, user]);

  const invalidateProjectsCache = useCallback(() => {
    if (user) {
      deleteCachedData(`projects_${user.email}`);
    }
  }, [user]);

  return {
    getUserProjects,
    invalidateProjectsCache,
    refreshData,
  };
}
