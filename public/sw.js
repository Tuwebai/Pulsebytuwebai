// Pulse by TuWebAI - Service Worker
// Maneja notificaciones push del navegador

function buildNotificationTitle(data) {
  return data.ticketSubject || data.title || 'Pulse by TuWebAI';
}

function buildNotificationBody(data) {
  const senderName = typeof data.senderName === 'string' ? data.senderName.trim() : '';
  const message = typeof data.body === 'string' && data.body.trim() ? data.body.trim() : 'Tienes una nueva notificacion en Pulse';

  return senderName ? `${senderName}\n${message}` : message;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = { title: 'Pulse', body: event.data.text() };
  }

  const options = {
    badge: '/favicon.ico',
    body: buildNotificationBody(data),
    data: {
      category: data.category || 'system',
      primaryKey: data.primaryKey || null,
      senderName: data.senderName || null,
      ticketId: data.ticketId || null,
      ticketSubject: data.ticketSubject || null,
      url: data.url || '/dashboard',
    },
    icon: '/favicon.ico',
    requireInteraction: false,
    tag: data.primaryKey || undefined,
  };

  event.waitUntil(self.registration.showNotification(buildNotificationTitle(data), options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationUrl = event.notification.data?.url || '/dashboard';
  const ticketId = event.notification.data?.ticketId || null;
  const url = new URL(notificationUrl, self.location.origin);

  if (ticketId) {
    url.searchParams.set('ticket', ticketId);
    url.searchParams.set('focusInput', '1');
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url.pathname) && 'focus' in client) {
          client.postMessage({
            type: 'PULSE_PUSH_OPEN',
            payload: event.notification.data,
          });
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url.toString());
      }

      return undefined;
    }),
  );
});

self.addEventListener('message', (event) => {
  const type = event.data?.type;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))),
    );
    return;
  }

  if (type === 'GET_CACHE_SIZE' && event.ports?.[0]) {
    event.waitUntil(
      caches.keys().then(async (cacheNames) => {
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          for (const request of keys) {
            const response = await cache.match(request);

            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }

        event.ports[0].postMessage({ type: 'CACHE_SIZE', size: totalSize });
      }),
    );
  }
});
