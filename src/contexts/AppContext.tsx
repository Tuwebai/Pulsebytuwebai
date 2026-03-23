import React, { createContext, useContext, useState } from 'react';
import { SupabaseError } from '@/components/SupabaseError';
import { toast as toastGlobal } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { clearCache } from '@/contexts/appContext.cache';
import type { AppContextType, Project, ProjectLog } from '@/contexts/appContext.types';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useAppProjects } from '@/features/project/hooks/useAppProjects';
import { userPreferencesService } from '@/lib/services/userPreferencesService';

export type { AppContextType, Project, ProjectLog, User } from '@/contexts/appContext.types';

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  const projectsState = useAppProjects({
    logs,
    projects,
    setError,
    setLoading,
    setLogs,
    setProjects,
    user
  });

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
    createProject: projectsState.createProject,
    updateProject: projectsState.updateProject,
    deleteProject: projectsState.deleteProject,
    addFunctionalities: projectsState.addFunctionalities,
    addCommentToPhase: projectsState.addCommentToPhase,
    addLog: projectsState.addLog,
    getProjectLogs: projectsState.getProjectLogs,
    refreshData: projectsState.refreshData,
    clearError,
    updateUserSettings,
    getUserProjects: projectsState.getUserProjects
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
