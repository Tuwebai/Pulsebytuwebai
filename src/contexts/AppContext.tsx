import React, { useMemo, useState } from 'react';
import { SupabaseError } from '@/core/components/SupabaseError';
import type { Project, ProjectLog } from '@/contexts/appContext.types';
import { AppContext } from '@/contexts/appContext.shared';
import { useAppAuth } from '@/features/auth/hooks/useAppAuth';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';
import { useAppProjects } from '@/features/project/hooks/useAppProjects';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsReady, setProjectsReady] = useState(false);
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
    setProjectsReady,
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

  const contextValue = useMemo(
    () => ({
      user,
      projects,
      projectsReady,
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
      projectsReady,
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
