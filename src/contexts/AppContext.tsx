import React, { createContext, useContext, useMemo, useState } from 'react';
import { SupabaseError } from '@/components/SupabaseError';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { AppContextType, Project, ProjectLog } from '@/contexts/appContext.types';
import { defaultAppContext } from '@/contexts/appContext.default';
import { useAppAuth } from '@/features/auth/hooks/useAppAuth';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useSessionTimeout } from '@/features/auth/hooks/useSessionTimeout';
import { useAppProjects } from '@/features/project/hooks/useAppProjects';

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

  const authActions = useAppAuth({
    setError,
    setLoading,
    signInWithEmail,
    signInWithGithub,
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    user
  });

  useSessionTimeout({
    enabled: Boolean(isAuthenticated && user?.session_timeout),
    onTimeout: authActions.logout,
    timeoutMinutes: user?.session_timeout ?? 30,
  });

  const contextValue = useMemo(
    () => ({
      user,
      projects,
      isAuthenticated,
      authReady,
      logs,
      loading,
      error,
      ...authActions,
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
    }),
    [
      authActions,
      authReady,
      clearError,
      error,
      isAuthenticated,
      loading,
      logs,
      projects,
      projectsState,
      updateUserSettings,
      user
    ]
  );

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
    return defaultAppContext;
  }

  return context;
}
