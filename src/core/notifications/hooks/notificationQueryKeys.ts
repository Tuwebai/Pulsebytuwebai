export const notificationQueryKeys = {
  list: (userId: string | null) => ['notifications', userId ?? 'anon'] as const,
  preferences: (userId: string | null) => ['notification-preferences', userId ?? 'anon'] as const,
  pushStatus: (userId: string | null) => ['push-notifications-status', userId ?? 'anon'] as const,
  unreadCount: (userId: string | null) => ['notifications-unread-count', userId ?? 'anon'] as const,
};
