import { useEffect } from 'react';
import { usePushNotifications } from '@/core/notifications/hooks/usePushNotifications';
import { playPulseNotificationSound } from '@/lib/audio/notificationSound';

export function PushSubscriptionBootstrap() {
  usePushNotifications();

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'PULSE_PUSH_SOUND') {
        return;
      }

      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        return;
      }

      playPulseNotificationSound();
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
  }, []);

  return null;
}
