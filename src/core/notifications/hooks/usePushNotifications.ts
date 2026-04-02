import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deactivatePushSubscription,
  fetchActivePushSubscription,
  upsertPushSubscription,
} from '@/api/notifications/pushSubscriptionsApi';
import type { PushSubscriptionStatus } from '@/data/types/notifications';
import {
  getBrowserPushSubscription,
  getPushPermissionState,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from '@/core/notifications/services/pushNotifications.service';

async function readPushStatus(): Promise<PushSubscriptionStatus> {
  const permission = getPushPermissionState();

  if (permission === 'unsupported') {
    return {
      endpoint: null,
      isSubscribed: false,
      isSupported: false,
      permission,
    };
  }

  const [browserSubscription, dbEndpoint] = await Promise.all([
    getBrowserPushSubscription(),
    fetchActivePushSubscription(),
  ]);

  const endpoint = browserSubscription?.endpoint ?? dbEndpoint ?? null;

  if (browserSubscription?.endpoint) {
    const keys = browserSubscription.toJSON().keys;

    if (keys?.p256dh && keys.auth) {
      await upsertPushSubscription({
        endpoint: browserSubscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
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
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ['push-notifications-status'],
    queryFn: readPushStatus,
    staleTime: 1000 * 60 * 5,
  });

  const enablePush = useMutation({
    mutationFn: async () => {
      const subscription = await subscribeBrowserPush();
      const keys = subscription.toJSON().keys;

      if (!keys?.p256dh || !keys.auth) {
        throw new Error('PUSH_KEYS_MISSING');
      }

      await upsertPushSubscription({
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: navigator.userAgent,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['push-notifications-status'] });
    },
  });

  const disablePush = useMutation({
    mutationFn: async () => {
      const endpoint = await unsubscribeBrowserPush();

      if (endpoint || status.data?.endpoint) {
        await deactivatePushSubscription(endpoint || status.data?.endpoint || '');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['push-notifications-status'] });
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
