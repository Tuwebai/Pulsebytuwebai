import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead } from '@/api/notifications/notificationsApi';
import type { Notification } from '@/data/types/notifications';
import { groupNotificationsByDay } from '../services/notifications.service';
import { notificationQueryKeys } from './notificationQueryKeys';

interface NotificationsSnapshot {
  notifications: Notification[];
  unreadCount: number;
}

function readNotificationsSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null,
): NotificationsSnapshot {
  return {
    notifications: queryClient.getQueryData<Notification[]>(notificationQueryKeys.list(userId)) ?? [],
    unreadCount: queryClient.getQueryData<number>(notificationQueryKeys.unreadCount(userId)) ?? 0
  };
}

function writeNotificationsSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null,
  snapshot: NotificationsSnapshot,
) {
  queryClient.setQueryData(notificationQueryKeys.list(userId), snapshot.notifications);
  queryClient.setQueryData(notificationQueryKeys.unreadCount(userId), snapshot.unreadCount);
}

export function useNotifications() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const notificationsQueryKey = notificationQueryKeys.list(user?.id ?? null);
  const unreadCountQueryKey = notificationQueryKeys.unreadCount(user?.id ?? null);

  const { data: notifications, isLoading } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => fetchNotifications(20),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5
  });

  const { data: unreadCount } = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: fetchUnreadCount,
    enabled: Boolean(user?.id),
    staleTime: 1000 * 30
  });

  const markRead = useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const previous = readNotificationsSnapshot(queryClient, user?.id ?? null);
      const target = previous.notifications.find((notification) => notification.id === notificationId);

      if (!target || target.is_read) {
        return { previous };
      }

      writeNotificationsSnapshot(queryClient, user?.id ?? null, {
        notifications: previous.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
        unreadCount: Math.max(0, previous.unreadCount - 1)
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeNotificationsSnapshot(queryClient, user?.id ?? null, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    }
  });

  const markAllRead = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const previous = readNotificationsSnapshot(queryClient, user?.id ?? null);
      const hasUnread = previous.notifications.some((notification) => !notification.is_read);

      if (!hasUnread && previous.unreadCount === 0) {
        return { previous };
      }

      writeNotificationsSnapshot(queryClient, user?.id ?? null, {
        notifications: previous.notifications.map((notification) =>
          notification.is_read ? notification : { ...notification, is_read: true },
        ),
        unreadCount: 0
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeNotificationsSnapshot(queryClient, user?.id ?? null, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
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
