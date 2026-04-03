interface BrowserNotificationPayload {
  action_url?: string | null;
  id: string;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  title: string;
}

function buildNotificationTitle(notification: BrowserNotificationPayload) {
  const ticketSubject =
    typeof notification.metadata?.ticket_subject === 'string' ? notification.metadata.ticket_subject.trim() : '';

  return ticketSubject || notification.title;
}

function buildNotificationBody(notification: BrowserNotificationPayload) {
  const senderName =
    typeof notification.metadata?.sender_name === 'string' ? notification.metadata.sender_name.trim() : '';
  const message = notification.message?.trim() || 'Tienes una nueva notificación en Pulse.';

  return senderName ? `${senderName}\n${message}` : message;
}

function canShowRuntimeNotification() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    Notification.permission === 'granted'
  );
}

export async function showForegroundNotification(notification: BrowserNotificationPayload) {
  if (!canShowRuntimeNotification()) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const tag = notification.id;
  const existingNotifications = await registration.getNotifications({ tag });

  existingNotifications.forEach((item) => item.close());

  await registration.showNotification(buildNotificationTitle(notification), {
    badge: '/favicon.ico',
    body: buildNotificationBody(notification),
    data: {
      id: notification.id,
      senderName: typeof notification.metadata?.sender_name === 'string' ? notification.metadata.sender_name : null,
      ticketId: typeof notification.metadata?.ticket_id === 'string' ? notification.metadata.ticket_id : null,
      ticketSubject: typeof notification.metadata?.ticket_subject === 'string' ? notification.metadata.ticket_subject : null,
      url: notification.action_url || '/dashboard',
    },
    icon: '/favicon.ico',
    tag,
  });
}
