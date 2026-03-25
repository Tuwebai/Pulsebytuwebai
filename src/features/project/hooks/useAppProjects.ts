import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect } from 'react';
import { deleteCachedData, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { Project, ProjectLog, User } from '@/contexts/appContext.types';
import { projectService } from '@/lib/services/projectService';

type ProjectPhase = NonNullable<Project['fases']>[number];
type ProjectProgressSnapshot = NonNullable<Project['progressHistory']>[number];

interface UseAppProjectsParams {
  logs: ProjectLog[];
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setLogs: Dispatch<SetStateAction<ProjectLog[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setProjectsReady: Dispatch<SetStateAction<boolean>>;
  user: User | null;
  projects: Project[];
}

export function useAppProjects({
  logs,
  projects,
  setError,
  setLoading,
  setLogs,
  setProjects,
  setProjectsReady,
  user
}: UseAppProjectsParams) {
  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setProjectsReady(false);

      let projectData: Project[] = [];

      if (user.role === 'admin') {
        const response = await projectService.getProjects();
        projectData = (response?.projects || []) as Project[];
      } else {
        projectData = (await projectService.getProjectsByUser(user.id)) as Project[];
      }

      setProjects(projectData);
    } catch {
      setError('Error al recargar los datos');
    } finally {
      setProjectsReady(true);
      setLoading(false);
    }
  }, [setError, setLoading, setProjects, setProjectsReady, user]);

  const getUserProjects = useCallback(() => {
    if (!user) return [];

    if (user.role === 'admin') {
      return projects;
    }

    return projects.filter((project) => project.created_by === user.id);
  }, [projects, user]);

  const setupProjects = useCallback(async () => {
    if (!user) {
      setProjectsReady(false);
      setProjects([]);
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      setProjectsReady(false);

      let projectData: Project[] = [];

      if (user.role === 'admin') {
        const response = await projectService.getProjects();
        projectData = (response?.projects || []) as Project[];
      } else {
        projectData = (await projectService.getProjectsByUser(user.id)) as Project[];
      }

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
  }, [setError, setLoading, setLogs, setProjects, setProjectsReady, user]);

  useEffect(() => {
    if (user) {
      void setupProjects();
    }
  }, [setupProjects, user]);

  const createProject = useCallback(
    async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerEmail'>) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        if (!user.id || user.id.trim() === '') {
          throw new Error('ID de usuario inválido. No se puede crear el proyecto.');
        }

        const newProject = {
          ...projectData,
          created_by: user.id,
          status: 'development' as const,
          technologies: projectData.technologies || []
        };

        const createdProject = await projectService.createProject(newProject);

        if (createdProject) {
          setProjects((previousProjects) => [...previousProjects, createdProject as Project]);
        }

        deleteCachedData(`projects_${user.email}`);
      } catch {
        setError('Error al crear el proyecto');
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setProjects, user]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      try {
        setLoading(true);
        setError(null);

        const currentProject = (await projectService.getProjectById(id)) as Project;
        const progressHistory: ProjectProgressSnapshot[] = [...(currentProject.progressHistory || [])];
        let prevProgress = 0;

        const currentPhases = currentProject.fases || [];
        if (currentPhases.length > 0) {
          const completed = currentPhases.filter((phase) => phase.estado === 'Terminado').length;
          prevProgress = Math.round((completed / currentPhases.length) * 100);
        }

        let newProgress = prevProgress;
        const updatedPhases = updates.fases || [];
        if (updatedPhases.length > 0) {
          const completed = updatedPhases.filter((phase) => phase.estado === 'Terminado').length;
          newProgress = Math.round((completed / updatedPhases.length) * 100);
        }

        const today = new Date().toISOString().slice(0, 10);
        if (newProgress !== prevProgress) {
          const snapshotIndex = progressHistory.findIndex((historyItem) => historyItem.date === today);
          if (snapshotIndex >= 0) {
            progressHistory[snapshotIndex] = { date: today, progress: newProgress };
          } else {
            progressHistory.push({ date: today, progress: newProgress });
          }
        }

        await projectService.updateProject(id, {
          ...updates,
          progressHistory
        });

        if (user) {
          deleteCachedData(`projects_${user.email}`);
        }
      } catch {
        setError('Error al actualizar el proyecto');
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, user]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error('ID de usuario inválido. No se puede eliminar el proyecto.');
        }

        await projectService.deleteProject(id, user.id, user.role);
        setProjects((previousProjects) => previousProjects.filter((project) => project.id !== id));

        deleteCachedData(`projects_${user.email}`);
      } catch (deleteError) {
        setError('Error al eliminar el proyecto');
        throw deleteError;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setProjects, user]
  );

  const addFunctionalities = useCallback(
    async (projectId: string, functionalities: string[]) => {
      try {
        setLoading(true);
        setError(null);

        const currentProject = (await projectService.getProjectById(projectId)) as Project;
        const currentFunctionalities = currentProject.funcionalidades || [];
        const updatedFunctionalities = [...currentFunctionalities, ...functionalities];

        await projectService.updateProject(projectId, {
          funcionalidades: updatedFunctionalities
        });

        if (user) {
          deleteCachedData(`projects_${user.email}`);
        }
      } catch {
        setError('Error al agregar funcionalidades');
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, user]
  );

  const addCommentToPhase = useCallback(
    async (
      projectId: string,
      faseKey: string,
      comment: {
        texto: string;
        autor: string;
        tipo: 'admin' | 'cliente';
      }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const currentProject = (await projectService.getProjectById(projectId)) as Project;
        const phases: ProjectPhase[] = currentProject.fases || [];

        const updatedPhases = phases.map((phase) => {
          if (phase.key === faseKey) {
            const comments = phase.comentarios || [];
            const newComment = {
              id: Date.now().toString(),
              ...comment,
              fecha: new Date().toISOString()
            };

            return {
              ...phase,
              comentarios: [...comments, newComment]
            };
          }

          return phase;
        });

        await projectService.updateProject(projectId, {
          fases: updatedPhases
        });

        if (user) {
          deleteCachedData(`projects_${user.email}`);
        }
      } catch {
        setError('Error al agregar comentario');
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, user]
  );

  const addLog = useCallback(async () => {
    try {
      if (user) {
        deleteCachedData(`logs_${user.email}`);
      }
    } catch {
      // Los logs no son críticos para bloquear la UI.
    }
  }, [user]);

  const getProjectLogs = useCallback(
    (projectId: string) => {
      const cacheKey = `project_logs_${projectId}`;
      const cachedLogs = getCachedData<ProjectLog[]>(cacheKey);

      if (cachedLogs) {
        return cachedLogs;
      }

      const projectLogs = logs.filter((log) => log.projectId === projectId);
      setCachedData(cacheKey, projectLogs, 5 * 60 * 1000);

      return projectLogs;
    },
    [logs]
  );

  return {
    addCommentToPhase,
    addFunctionalities,
    addLog,
    createProject,
    deleteProject,
    getProjectLogs,
    getUserProjects,
    logs,
    projects,
    refreshData,
    setLogs,
    setProjects,
    updateProject
  };
}
