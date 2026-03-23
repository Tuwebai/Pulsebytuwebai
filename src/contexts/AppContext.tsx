import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SupabaseError } from '@/components/SupabaseError';
import { toast as toastGlobal } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { projectService } from '@/lib/services/projectService';
import { userPreferencesService } from '@/lib/services/userPreferencesService';
import { clearCache, deleteCachedData, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { AppContextType, Project, ProjectLog } from '@/contexts/appContext.types';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type { AppContextType, Project, ProjectLog, User } from '@/contexts/appContext.types';

const AppContext = createContext<AppContextType | undefined>(undefined);

type ProjectPhase = NonNullable<Project['fases']>[number];
type ProjectProgressSnapshot = NonNullable<Project['progressHistory']>[number];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    user: supabaseUser,
    session,
    loading: authLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    clearError: clearAuthError
  } = useSupabaseAuth();

  const { authReady, clearError, isAuthenticated, updateUserSettings, user } = useCurrentUser({
    authLoading,
    clearAuthError,
    session,
    setError,
    setLoading,
    setLogs,
    setProjects,
    supabaseUser
  });

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      clearCache();

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
      setLoading(false);
    }
  }, [user]);

  const getUserProjects = useCallback(() => {
    if (!user) return [];

    if (user.role === 'admin') {
      return projects;
    }

    return projects.filter((project) => project.created_by === user.id);
  }, [projects, user]);

  const setupListeners = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLogs([]);
      return;
    }

    try {
      setLoading(true);

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
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void setupListeners();
    }
  }, [setupListeners, user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithEmail(email, password);

      if (result) {
        toastGlobal({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión correctamente.'
        });
      }

      return result;
    } catch {
      setError('Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await signUpWithEmail(email, password, { full_name: name });
      return true;
    } catch {
      setError('Error al registrar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await signInWithGoogle();
    } catch {
      setError('Error al iniciar sesión con Google');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await signInWithGithub();
    } catch {
      setError('Error al iniciar sesión con GitHub');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      clearCache();

      if (user) {
        await userPreferencesService.deleteUserPreference(user.id, 'welcome_back', 'tuwebai_welcome_back');
      }
    } catch {
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerEmail'>) => {
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
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
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
  };

  const deleteProject = async (id: string) => {
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
  };

  const addFunctionalities = async (projectId: string, functionalities: string[]) => {
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
  };

  const addCommentToPhase = async (
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
  };

  const addLog = async () => {
    try {
      if (user) {
        deleteCachedData(`logs_${user.email}`);
      }
    } catch {
      // Los logs no son críticos para bloquear la UI.
    }
  };

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

  const contextValue = {
    user,
    projects,
    isAuthenticated,
    authReady,
    logs,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    createProject,
    updateProject,
    deleteProject,
    addFunctionalities,
    addCommentToPhase,
    addLog,
    getProjectLogs,
    refreshData,
    clearError,
    updateUserSettings,
    getUserProjects
  };

  if (
    error &&
    (error.includes('Invalid API key') ||
      error.includes('Clave API de Supabase inválida') ||
      error.includes('Error de configuración'))
  ) {
    return (
      <SupabaseError
        error={error}
        onRetry={() => {
          clearError();
          window.location.reload();
        }}
      />
    );
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (context === undefined) {
    return {
      user: null,
      projects: [],
      isAuthenticated: false,
      authReady: false,
      logs: [],
      loading: true,
      error: 'Contexto no disponible',
      login: async () => false,
      register: async () => false,
      loginWithGoogle: async () => false,
      loginWithGithub: async () => false,
      logout: async () => {},
      createProject: async () => {},
      updateProject: async () => {},
      deleteProject: async () => {},
      addFunctionalities: async () => {},
      addCommentToPhase: async () => {},
      addLog: async () => {},
      getProjectLogs: () => [],
      refreshData: async () => {},
      clearError: () => {},
      updateUserSettings: async () => false,
      getUserProjects: () => []
    };
  }

  return context;
}
