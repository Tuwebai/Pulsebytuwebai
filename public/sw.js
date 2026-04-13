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

function buildNotificationTag(data) {
  if (typeof data.ticketId === 'string' && data.ticketId.trim()) {
    return `support-ticket:${data.ticketId.trim()}`;
  }

  return data.primaryKey || undefined;
}

function buildNotificationMessages(existingMessages, nextBody) {
  const messages = Array.isArray(existingMessages) ? existingMessages.filter((message) => typeof message === 'string' && message.trim()) : [];
  return [...messages, nextBody].slice(-5);
}

function buildGroupedNotificationBody(messages) {
  if (!messages.length) {
    return 'Tienes una nueva notificacion en Pulse';
  }

  if (messages.length === 1) {
    return messages[0];
  }

  const latestMessages = messages.slice(-3);
  const summary = `${messages.length} mensajes nuevos`;
  return `${summary}\n${latestMessages.join('\n')}`;
}

function notifyClientsToPlayPushSound(payload) {
  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    if (!clientList.length) {
      return;
    }

    const hasVisibleClient = clientList.some((client) => client.visibilityState === 'visible' || client.focused);

    if (hasVisibleClient) {
      return;
    }

    clientList[0].postMessage({
      type: 'PULSE_PUSH_SOUND',
      payload,
    });
  });
}

function normalizeNotificationTarget(rawUrl) {
  try {
    const nextUrl = new URL(rawUrl || '/dashboard', self.location.origin);
    const isLocalHost = nextUrl.hostname === 'localhost' || nextUrl.hostname === '127.0.0.1';
    const currentHostIsLocal = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

    if (isLocalHost && !currentHostIsLocal) {
      nextUrl.protocol = self.location.protocol;
      nextUrl.host = self.location.host;
    }

    return nextUrl;
  } catch {
    return new URL('/dashboard', self.location.origin);
  }
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

  const nextBody = buildNotificationBody(data);
  const tag = buildNotificationTag(data);

  event.waitUntil(
    self.registration.getNotifications(tag ? { tag } : undefined).then((existingNotifications) => {
      const existingNotification = existingNotifications[0];
      const mergedMessages = buildNotificationMessages(existingNotification?.data?.messages, nextBody);
      const options = {
        badge: '/favicon.ico',
        body: buildGroupedNotificationBody(mergedMessages),
        data: {
          category: data.category || 'system',
          messages: mergedMessages,
          primaryKey: data.primaryKey || null,
          senderName: data.senderName || null,
          ticketId: data.ticketId || null,
          ticketSubject: data.ticketSubject || null,
          url: data.url || '/dashboard',
        },
        icon: '/favicon.ico',
        renotify: Boolean(existingNotification),
        requireInteraction: false,
        tag,
      };

      return Promise.all([self.registration.showNotification(buildNotificationTitle(data), options), notifyClientsToPlayPushSound(options.data)]);
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationUrl = event.notification.data?.url || '/dashboard';
  const ticketId = event.notification.data?.ticketId || null;
  const url = normalizeNotificationTarget(notificationUrl);

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
