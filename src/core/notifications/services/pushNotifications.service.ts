import { serviceWorkerManager } from '@/utils/serviceWorker';

function getPushEndpointStorageKey(userId?: string | null) {
  return `pulse:push:endpoint:${userId ?? 'anon'}`;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getBrowserSupport() {
  return (
    typeof window !== 'undefined' &&
    (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function setStoredPushEndpoint(endpoint: string | null, userId?: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  const storageKey = getPushEndpointStorageKey(userId);

  if (!endpoint) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, endpoint);
}

export function getStoredPushEndpoint(userId?: string | null) {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(getPushEndpointStorageKey(userId));
}

async function getReadyRegistration() {
  const registration = await serviceWorkerManager.register();

  if (!registration) {
    throw new Error('PUSH_SERVICE_WORKER_FAILED');
  }

  return navigator.serviceWorker.ready;
}

async function resetBrowserPushState() {
  serviceWorkerManager.resetRegistration();

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(
    registrations.map(async (registration) => {
      const subscription = await registration.pushManager.getSubscription().catch(() => null);

      if (subscription) {
        await subscription.unsubscribe().catch(() => undefined);
      }

      await registration.unregister().catch(() => false);
    }),
  );
}

async function subscribeWithRegistration(vapidPublicKey: string) {
  const registration = await getReadyRegistration();

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });
}

export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (!getBrowserSupport()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export async function requestPushPermission() {
  if (!getBrowserSupport()) {
    throw new Error('PUSH_NOT_SUPPORTED');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return Notification.requestPermission();
}

export async function getBrowserPushSubscription() {
  if (!getBrowserSupport()) {
    return null;
  }

  const registration = await getReadyRegistration();
  return registration.pushManager.getSubscription();
}

export async function subscribeBrowserPush(userId?: string | null) {
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!getBrowserSupport()) {
    throw new Error('PUSH_NOT_SUPPORTED');
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('[Pulse] VITE_VAPID_PUBLIC_KEY no configurada');
    throw new Error('PUSH_CONFIG_MISSING');
  }

  const permission = await requestPushPermission();

  if (permission !== 'granted') {
    throw new Error('PUSH_PERMISSION_DENIED');
  }

  const existingSubscription = await getBrowserPushSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  try {
    const subscription = await subscribeWithRegistration(VAPID_PUBLIC_KEY);
    setStoredPushEndpoint(subscription.endpoint, userId);
    return subscription;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[Pulse] Push service error:', error);
      await resetBrowserPushState();

      try {
        const subscription = await subscribeWithRegistration(VAPID_PUBLIC_KEY);
        setStoredPushEndpoint(subscription.endpoint, userId);
        return subscription;
      } catch (retryError) {
        if (retryError instanceof DOMException && retryError.name === 'AbortError') {
          throw new Error('PUSH_SUBSCRIBE_ABORT');
        }

        throw retryError;
      }
    }

    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw new Error('PUSH_PERMISSION_DENIED');
    }

    throw error;
  }
}

export async function unsubscribeBrowserPush() {
  const existingSubscription = await getBrowserPushSubscription();

  if (!existingSubscription) {
    return null;
  }

  await existingSubscription.unsubscribe();
  return existingSubscription.endpoint;
}

export function persistPushEndpoint(endpoint: string | null, userId?: string | null) {
  setStoredPushEndpoint(endpoint, userId);
}

export function clearStoredPushEndpoint(userId?: string | null) {
  setStoredPushEndpoint(null, userId);
}
