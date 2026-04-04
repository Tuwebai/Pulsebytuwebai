import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import {
  deactivatePushSubscription,
  fetchActivePushSubscription,
  upsertPushSubscription,
} from '@/api/notifications/pushSubscriptionsApi';
import type { PushSubscriptionStatus } from '@/data/types/notifications';
import {
  clearStoredPushEndpoint,
  getBrowserPushSubscription,
  getPushPermissionState,
  getStoredPushEndpoint,
  persistPushEndpoint,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from '@/core/notifications/services/pushNotifications.service';
import { notificationQueryKeys } from './notificationQueryKeys';

async function resolveBrowserSubscription(userId: string, permission: NotificationPermission | 'unsupported') {
  const browserSubscription = await getBrowserPushSubscription();

  if (browserSubscription || permission !== 'granted') {
    return browserSubscription;
  }

  try {
    return await subscribeBrowserPush(userId);
  } catch (error) {
    console.warn('[Pulse] No pudimos reactivar la suscripcion push en segundo plano.', error);
    return null;
  }
}

async function readPushStatus(userId: string): Promise<PushSubscriptionStatus> {
  const permission = getPushPermissionState();

  if (permission === 'unsupported') {
    return {
      endpoint: null,
      isSubscribed: false,
      isSupported: false,
      permission,
    };
  }

  const browserSubscription = await resolveBrowserSubscription(userId, permission);
  const browserEndpoint = browserSubscription?.endpoint ?? getStoredPushEndpoint(userId);
  const dbEndpoint =
    (await fetchActivePushSubscription({ endpoint: browserEndpoint, userId })) ??
    (browserEndpoint ? await fetchActivePushSubscription({ userId }) : null);
  const endpoint = browserSubscription?.endpoint ?? dbEndpoint ?? null;

  if (browserSubscription?.endpoint) {
    const keys = browserSubscription.toJSON().keys;

    if (keys?.p256dh && keys.auth) {
      await upsertPushSubscription({
        endpoint: browserSubscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        userAgent: navigator.userAgent,
      });
      persistPushEndpoint(browserSubscription.endpoint, userId);
    }
  }

  return {
    endpoint,
    isSubscribed: Boolean(endpoint),
    isSupported: true,
    permission,
  };
}

export function usePushNotifications() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const queryKey = notificationQueryKeys.pushStatus(user?.id ?? null);
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  const status = useQuery({
    queryKey,
    queryFn: () => readPushStatus(user?.id ?? ''),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  const enablePush = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('PUSH_AUTH_REQUIRED');
      }

      const subscription = await subscribeBrowserPush(user.id);
      const keys = subscription.toJSON().keys;

      if (!keys?.p256dh || !keys.auth) {
        throw new Error('PUSH_KEYS_MISSING');
      }

      await upsertPushSubscription({
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: user.id,
        userAgent,
      });
      persistPushEndpoint(subscription.endpoint, user.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const disablePush = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('PUSH_AUTH_REQUIRED');
      }

      const endpoint = await unsubscribeBrowserPush();
      clearStoredPushEndpoint(user.id);

      await deactivatePushSubscription({
        endpoint: endpoint || status.data?.endpoint || null,
        userId: user.id,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    status: status.data,
    isLoading: status.isLoading,
    enablePush: enablePush.mutateAsync,
    disablePush: disablePush.mutateAsync,
    isSaving: enablePush.isPending || disablePush.isPending,
  };
}
