import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import {
  deactivatePushSubscription,
  fetchActivePushSubscription,
  upsertPushSubscription,
} from '@/api/notifications/pushSubscriptionsApi';
import type { PushSubscriptionStatus } from '@/data/types/notifications';
import {
  getBrowserPushSubscription,
  getPushPermissionState,
  getStoredPushEndpoint,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from '@/core/notifications/services/pushNotifications.service';

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

  const browserSubscription = await getBrowserPushSubscription();
  const browserEndpoint = browserSubscription?.endpoint ?? getStoredPushEndpoint();
  const dbEndpoint = await fetchActivePushSubscription({ endpoint: browserEndpoint, userId });

  if (!browserSubscription?.endpoint && dbEndpoint) {
    await deactivatePushSubscription({ endpoint: dbEndpoint, userId });
  }

  const endpoint = browserSubscription?.endpoint ?? null;

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
  const queryKey = ['push-notifications-status', user?.id ?? 'anon'];
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

      const subscription = await subscribeBrowserPush();
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
