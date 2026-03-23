import { useCallback, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import { userService } from '@/lib/supabase/supabaseService';
import { toast as toastGlobal } from '@/hooks/use-toast';
import { userPreferencesService } from '@/lib/services/userPreferencesService';
import { clearCache, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { User } from '@/contexts/appContext.types';

interface UserUpdatePayload {
  avatar_url?: string;
  updated_at?: string;
}

interface UseCurrentUserParams {
  authLoading: boolean;
  clearAuthError: () => void;
  session: Session | null;
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setLogs: (value: []) => void;
  setProjects: (value: []) => void;
  supabaseUser: SupabaseUser | null;
}

export function useCurrentUser({
  authLoading,
  clearAuthError,
  session,
  setError,
  setLoading,
  setLogs,
  setProjects,
  supabaseUser
}: UseCurrentUserParams) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    clearAuthError();
  }, [clearAuthError, setError]);

  const syncUser = useCallback(async () => {
    if (authLoading) return;

    if (supabaseUser && session) {
      try {
        setLoading(true);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('tuwebai_auth');
        }

        const cacheKey = `user_${supabaseUser.id}`;
        let userData = getCachedData<User>(cacheKey);

        if (!userData) {
          try {
            userData = await userService.getUserById(supabaseUser.id);
          } catch {
            const { email, user_metadata } = supabaseUser;

            const avatar =
              user_metadata?.avatar_url || user_metadata?.picture || user_metadata?.photoURL || user_metadata?.image;

            userData = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              full_name: user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || '',
              role: 'user',
              avatar_url: avatar,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await userService.upsertUser(userData);
          }

          setCachedData(cacheKey, userData, 10 * 60 * 1000);
        }

        if (userData && supabaseUser.email) {
          try {
            const updatedUserData = await userService.getUserById(supabaseUser.id);

            if (updatedUserData) {
              if (updatedUserData.avatar_url) {
                userData.avatar = updatedUserData.avatar_url;
              }

              if (!updatedUserData.avatar_url && supabaseUser.email) {
                const { realAvatarService } = await import('@/lib/config/avatarProviders');
                await realAvatarService.syncUserAvatar(supabaseUser.email);

                const finalUserData = await userService.getUserById(supabaseUser.id);
                if (finalUserData) {
                  userData = finalUserData;
                  if (finalUserData.avatar_url) {
                    userData.avatar = finalUserData.avatar_url;
                  }
                  setCachedData(cacheKey, userData, 10 * 60 * 1000);
                }
              }
            }
          } catch {
            // Error sincronizando avatar
          }
        }

        setUser(userData as User);
        setIsAuthenticated(true);
        setError(null);

        if (userData && userData.id) {
          await userPreferencesService.migrateLocalStorageToDB(userData.id);
        }

        if (userData && userData.id) {
          const welcomeBack = await userPreferencesService.getUserPreferences(userData.id, 'welcome_back');
          if (welcomeBack.length === 0) {
            toastGlobal({
              title: '¡Bienvenido!',
              description: 'Has iniciado sesión correctamente.'
            });
            await userPreferencesService.saveUserPreference(userData.id, 'welcome_back', 'tuwebai_welcome_back', 'true');
          }
        }
      } catch {
        setError('Error de autenticación');
      } finally {
        setAuthReady(true);
        setLoading(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setProjects([]);
      setLogs([]);
      clearCache();

      if (user && user.id) {
        await userPreferencesService.deleteUserPreference(user.id, 'welcome_back', 'tuwebai_welcome_back');
      }

      setAuthReady(true);
      setLoading(false);
    }
  }, [authLoading, session, setError, setLoading, supabaseUser, setProjects, setLogs, user]);

  useEffect(() => {
    void syncUser();
  }, [syncUser]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          const updatedUserData = payload.new as UserUpdatePayload;

          if (updatedUserData.avatar_url && updatedUserData.avatar_url !== user.avatar_url) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    avatar_url: updatedUserData.avatar_url,
                    avatar: updatedUserData.avatar_url,
                    updated_at: updatedUserData.updated_at
                  }
                : prev
            );

            const cacheKey = `user_${user.id}`;
            const cachedUser = getCachedData<User>(cacheKey);
            if (cachedUser) {
              setCachedData(
                cacheKey,
                {
                  ...cachedUser,
                  avatar_url: updatedUserData.avatar_url,
                  avatar: updatedUserData.avatar_url,
                  updated_at: updatedUserData.updated_at
                },
                10 * 60 * 1000
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    localStorage.removeItem('tuwebai_auth');

    if (isAuthenticated && user) {
      localStorage.setItem(
        'tuwebai_auth',
        JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          timestamp: Date.now()
        })
      );
    } else {
      localStorage.removeItem('tuwebai_auth');
    }
  }, [isAuthenticated, user]);

  const updateUserSettings = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return false;
      setLoading(true);
      try {
        await userService.updateUser(user.id, { ...updates, updated_at: new Date().toISOString() });
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
        setCachedData(`user_${user.id}`, { ...user, ...updates }, 10 * 60 * 1000);
        return true;
      } catch {
        setError('Error al actualizar configuración');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, user]
  );

  return {
    authReady,
    clearError,
    isAuthenticated,
    setUser,
    updateUserSettings,
    user
  };
}
