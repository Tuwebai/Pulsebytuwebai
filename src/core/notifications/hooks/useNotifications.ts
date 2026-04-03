import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead } from '@/api/notifications/notificationsApi';
import type { Notification } from '@/data/types/notifications';
import { groupNotificationsByDay } from '../services/notifications.service';

const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = ['notifications-unread-count'] as const;

interface NotificationsSnapshot {
  notifications: Notification[];
  unreadCount: number;
}

function readNotificationsSnapshot(queryClient: ReturnType<typeof useQueryClient>): NotificationsSnapshot {
  return {
    notifications: queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY) ?? [],
    unreadCount: queryClient.getQueryData<number>(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY) ?? 0
  };
}

function writeNotificationsSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: NotificationsSnapshot,
) {
  queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, snapshot.notifications);
  queryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, snapshot.unreadCount);
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchNotifications(20),
    staleTime: 1000 * 60 * 5
  });

  const { data: unreadCount } = useQuery({
    queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadCount,
    staleTime: 1000 * 30
  });

  const markRead = useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY });

      const previous = readNotificationsSnapshot(queryClient);
      const target = previous.notifications.find((notification) => notification.id === notificationId);

      if (!target || target.is_read) {
        return { previous };
      }

      writeNotificationsSnapshot(queryClient, {
        notifications: previous.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
        unreadCount: Math.max(0, previous.unreadCount - 1)
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeNotificationsSnapshot(queryClient, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY });
    }
  });

  const markAllRead = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY });

      const previous = readNotificationsSnapshot(queryClient);
      const hasUnread = previous.notifications.some((notification) => !notification.is_read);

      if (!hasUnread && previous.unreadCount === 0) {
        return { previous };
      }

      writeNotificationsSnapshot(queryClient, {
        notifications: previous.notifications.map((notification) =>
          notification.is_read ? notification : { ...notification, is_read: true },
        ),
        unreadCount: 0
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeNotificationsSnapshot(queryClient, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY });
    }
  });

  const grouped = useMemo(() => groupNotificationsByDay(notifications ?? []), [notifications]);

  return {
    notifications: notifications ?? [],
    grouped,
    unreadCount: unreadCount ?? 0,
    isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAllRead: markAllRead.isPending
  };
}
