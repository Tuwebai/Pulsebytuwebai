import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { userService } from '@/features/auth/services/user.service';
import { supabase } from '@/lib/supabase/supabase';
import { toast as toastGlobal } from '@/hooks/use-toast';
import { userPreferencesService } from '@/features/auth/services/userPreferences.service';
import { clearCache, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { User } from '@/contexts/appContext.types';
import { realAvatarService } from '@/lib/config/avatarProviders';
import { onboardingApi } from '@/api/pulse/onboardingApi';
import { hasPulseAccess } from '@/features/auth/utils/pulseAccess';
import { createFallbackAppUser, mergeOnboardingSnapshot, normalizeAppUser } from '@/features/auth/hooks/useCurrentUser.utils';
import {
  clearPersistedResolvedUser,
  persistResolvedUser,
  readPersistedResolvedUser,
} from '@/features/auth/services/authResolvedUserPersistence.service';
import { TransientUserFetchError } from '@/features/auth/services/user.service';

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
  website_status?: User['website_status'];
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
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
  const authSnapshotRef = useRef<{ accessToken: string | null; userId: string | null }>({
    accessToken: null,
    userId: null
  });
  const resolvedUserRef = useRef<User | null>(null);

  useEffect(() => {
    authSnapshotRef.current = {
      accessToken: session?.access_token ?? null,
      userId: supabaseUser?.id ?? null
    };
  }, [session?.access_token, supabaseUser?.id]);

  useEffect(() => {
    resolvedUserRef.current = user;
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
    clearAuthError();
  }, [clearAuthError, setError]);

  const syncUser = useCallback(async () => {
    if (authLoading) return;

    if (supabaseUser && session) {
      const requestAccessToken = session.access_token ?? null;
      const requestUserId = supabaseUser.id;
      const isStaleAuthFlow = () =>
        authSnapshotRef.current.accessToken !== requestAccessToken || authSnapshotRef.current.userId !== requestUserId;

      try {
        setLoading(true);

        const cacheKey = `user_${supabaseUser.id}`;
        let userData = getCachedData<User>(cacheKey) ?? readPersistedResolvedUser(supabaseUser.id);

        if (!userData) {
          try {
            userData = normalizeAppUser(await userService.getUserById(supabaseUser.id));
          } catch (error) {
            if (error instanceof TransientUserFetchError) {
              userData = readPersistedResolvedUser(supabaseUser.id);
            } else {
              throw error;
            }
          }

          if (!userData) {
            userData = createFallbackAppUser(supabaseUser);

            await userService.upsertUser(userData);
          }

          if (userData) {
            setCachedData(cacheKey, userData, 10 * 60 * 1000);
            persistResolvedUser(userData);
          }
        }

        if (!userData) {
          throw new Error('No se pudo resolver el usuario autenticado.');
        }

        if (userData && supabaseUser.email) {
          try {
            const updatedUserData = normalizeAppUser(await userService.getUserById(supabaseUser.id));
            const onboardingSnapshot = await onboardingApi.getUserSnapshot(supabaseUser.id);
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
                ? normalizeAppUser(await userService.getUserById(supabaseUser.id))
                : updatedUserData;

            if (finalUserData) {
              userData = finalUserData;
            }

            if (onboardingSnapshot) {
              userData = mergeOnboardingSnapshot(userData, onboardingSnapshot);
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
            persistResolvedUser(userData);
          } catch {
            // Error sincronizando avatar
          }
        }

        setUser(userData as User);
        setIsAuthenticated(true);
        setError(null);
        persistResolvedUser(userData as User);

        if (userData && userData.id && !isStaleAuthFlow()) {
          await userPreferencesService.migrateLocalStorageToDB(userData.id);
        }

        if (userData && userData.id && hasPulseAccess(userData.pulse_access_status) && !isStaleAuthFlow()) {
          const welcomeBack = await userPreferencesService.getUserPreferences(userData.id, 'welcome_back');
          if (welcomeBack.length === 0) {
            toastGlobal({
              title: '¡Bienvenido!',
              description: 'Has iniciado sesión correctamente.'
            });
            await userPreferencesService.saveUserPreference(userData.id, 'welcome_back', 'tuwebai_welcome_back', 'true');
          }
        }
      } catch (error) {
        const persistedUser = readPersistedResolvedUser(supabaseUser.id) ?? resolvedUserRef.current;

        if (persistedUser) {
          setUser(persistedUser);
          setIsAuthenticated(true);
          setError(null);
          setCachedData(`user_${persistedUser.id}`, persistedUser, 10 * 60 * 1000);
        } else {
          setError(error instanceof Error ? error.message : 'Error de autenticación');
        }
      } finally {
        setAuthReady(true);
        setLoading(false);
      }
    } else {
      try {
        const {
          data: { session: liveSession },
        } = await supabase.auth.getSession();

        if (liveSession?.user) {
          setAuthReady(true);
          setLoading(false);
          return;
        }
      } catch {
        // Si Supabase falla al revalidar, seguimos con limpieza controlada.
      }

      setUser(null);
      setIsAuthenticated(false);
      setProjects([]);
      setLogs([]);
      clearCache();
      clearPersistedResolvedUser(resolvedUserRef.current?.id ?? authSnapshotRef.current.userId);

      setAuthReady(true);
      setLoading(false);
    }
  }, [authLoading, session, setError, setLoading, supabaseUser, setProjects, setLogs]);

  useEffect(() => {
    void syncUser();
  }, [syncUser]);

  useEffect(() => {
    localStorage.removeItem('tuwebai_auth');
  }, []);

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
              website_status: updatedUserData.website_status ?? prev.website_status,
              website_submitted_at: updatedUserData.website_submitted_at ?? prev.website_submitted_at,
              website_reviewed_at: updatedUserData.website_reviewed_at ?? prev.website_reviewed_at,
              website_reviewed_by: updatedUserData.website_reviewed_by ?? prev.website_reviewed_by,
              website_review_notes: updatedUserData.website_review_notes ?? prev.website_review_notes,
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
            persistResolvedUser(nextUser);

            return nextUser;
          });
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe().catch(() => undefined);
    };
  }, [user]);

  const updateUserSettings = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return false;
      setLoading(true);
      try {
        await userService.updateUser(user.id, { ...updates, updated_at: new Date().toISOString() });
        setUser((prev) => {
          if (!prev) {
            return prev;
          }

          const nextUser = { ...prev, ...updates };
          persistResolvedUser(nextUser);
          return nextUser;
        });
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
