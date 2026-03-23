import type { GroupedNotifications, Notification } from '@/data/types/notifications';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function groupNotificationsByDay(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const today = startOfDay(now);
  const todayTime = today.getTime();

  return notifications.reduce<GroupedNotifications>(
    (groups, notification) => {
      const createdAt = new Date(notification.created_at);
      const createdDay = startOfDay(createdAt).getTime();
      const diffDays = Math.floor((todayTime - createdDay) / DAY_MS);

      if (diffDays <= 0) {
        groups.today.push(notification);
      } else if (diffDays < 7) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }

      return groups;
    },
    { today: [], thisWeek: [], older: [] }
  );
}

export function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const today = startOfDay(now).getTime();
  const targetDay = startOfDay(date).getTime();
  const diffDays = Math.floor((today - targetDay) / DAY_MS);
  const timeLabel = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);

  if (diffDays <= 0) {
    return `Hoy ${timeLabel}`;
  }

  if (diffDays === 1) {
    return `Ayer ${timeLabel}`;
  }

  if (diffDays < 7) {
    return WEEKDAY_LABELS[date.getDay()];
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
