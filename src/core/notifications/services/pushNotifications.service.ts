import { serviceWorkerManager } from '@/utils/serviceWorker';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);

  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

function getBrowserSupport() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (!getBrowserSupport()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export async function getBrowserPushSubscription() {
  if (!getBrowserSupport()) {
    return null;
  }

  await serviceWorkerManager.register();
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeBrowserPush() {
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!getBrowserSupport()) {
    throw new Error('PUSH_NOT_SUPPORTED');
  }

  if (!vapidPublicKey) {
    throw new Error('PUSH_CONFIG_MISSING');
  }

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('PUSH_PERMISSION_DENIED');
  }

  await serviceWorkerManager.register();
  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

export async function unsubscribeBrowserPush() {
  const existingSubscription = await getBrowserPushSubscription();

  if (!existingSubscription) {
    return null;
  }

  await existingSubscription.unsubscribe();
  return existingSubscription.endpoint;
}
