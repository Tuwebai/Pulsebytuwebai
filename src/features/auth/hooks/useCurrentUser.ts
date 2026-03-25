import { useCallback, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import { userService } from '@/lib/supabase/supabaseService';
import { toast as toastGlobal } from '@/hooks/use-toast';
import { userPreferencesService } from '@/lib/services/userPreferencesService';
import { clearCache, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { User } from '@/contexts/appContext.types';
import { realAvatarService } from '@/lib/config/avatarProviders';

interface UserUpdatePayload {
  full_name?: string | null;
  avatar_url?: string;
  role?: User['role'];
  animations_enabled?: boolean | null;
  low_bandwidth_mode?: boolean | null;
  two_factor_auth?: boolean | null;
  session_timeout?: number | null;
  login_notifications?: boolean | null;
  device_management?: boolean | null;
  notif_new_consultation?: boolean | null;
  notif_monthly_summary?: boolean | null;
  notif_project_update?: boolean | null;
  onboarding_completed?: boolean | null;
  onboarding_completed_at?: string | null;
  website?: string | null;
  pulse_access_status?: User['pulse_access_status'];
  pulse_access_granted_at?: string | null;
  pulse_access_granted_by?: string | null;
  pulse_access_disabled_at?: string | null;
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
            const authAvatar = realAvatarService.getAuthMetadataAvatar(supabaseUser);
            const storedAvatar = updatedUserData?.avatar_url ?? userData.avatar_url ?? null;

            const shouldUseAuthAvatar =
              Boolean(authAvatar) &&
              (!storedAvatar ||
                !realAvatarService.shouldKeepStoredAvatar(storedAvatar) ||
                (!realAvatarService.isPulseStorageAvatar(storedAvatar) && storedAvatar !== authAvatar));

            if (shouldUseAuthAvatar && authAvatar) {
              await userService.updateUser(supabaseUser.id, {
                avatar_url: authAvatar,
                updated_at: new Date().toISOString(),
              });
            }

            const finalUserData =
              shouldUseAuthAvatar
                ? await userService.getUserById(supabaseUser.id)
                : updatedUserData;

            if (finalUserData) {
              userData = finalUserData;
            }

            const resolvedAvatar =
              finalUserData?.avatar_url ??
              updatedUserData?.avatar_url ??
              userData.avatar_url ??
              authAvatar ??
              undefined;

            if (resolvedAvatar) {
              userData.avatar_url = resolvedAvatar;
              userData.avatar = resolvedAvatar;
            }

            setCachedData(cacheKey, userData, 10 * 60 * 1000);
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
          setUser((prev) => {
            if (!prev) {
              return prev;
            }

            const nextUser: User = {
              ...prev,
              full_name: updatedUserData.full_name ?? prev.full_name,
              role: updatedUserData.role ?? prev.role,
              animations_enabled: updatedUserData.animations_enabled ?? prev.animations_enabled,
              low_bandwidth_mode: updatedUserData.low_bandwidth_mode ?? prev.low_bandwidth_mode,
              two_factor_auth: updatedUserData.two_factor_auth ?? prev.two_factor_auth,
              session_timeout: updatedUserData.session_timeout ?? prev.session_timeout,
              login_notifications: updatedUserData.login_notifications ?? prev.login_notifications,
              device_management: updatedUserData.device_management ?? prev.device_management,
              notif_new_consultation: updatedUserData.notif_new_consultation ?? prev.notif_new_consultation,
              notif_monthly_summary: updatedUserData.notif_monthly_summary ?? prev.notif_monthly_summary,
              notif_project_update: updatedUserData.notif_project_update ?? prev.notif_project_update,
              onboarding_completed: updatedUserData.onboarding_completed ?? prev.onboarding_completed,
              onboarding_completed_at: updatedUserData.onboarding_completed_at ?? prev.onboarding_completed_at,
              website: updatedUserData.website ?? prev.website,
              pulse_access_status: updatedUserData.pulse_access_status ?? prev.pulse_access_status,
              pulse_access_granted_at: updatedUserData.pulse_access_granted_at ?? prev.pulse_access_granted_at,
              pulse_access_granted_by: updatedUserData.pulse_access_granted_by ?? prev.pulse_access_granted_by,
              pulse_access_disabled_at: updatedUserData.pulse_access_disabled_at ?? prev.pulse_access_disabled_at,
              updated_at: updatedUserData.updated_at ?? prev.updated_at
            };

            if (updatedUserData.avatar_url) {
              nextUser.avatar_url = updatedUserData.avatar_url;
              nextUser.avatar = updatedUserData.avatar_url;
            }

            setCachedData(`user_${user.id}`, nextUser, 10 * 60 * 1000);

            return nextUser;
          });
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
