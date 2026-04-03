import { usePushNotifications } from '@/core/notifications/hooks/usePushNotifications';

export function PushSubscriptionBootstrap() {
  usePushNotifications();
  return null;
}
