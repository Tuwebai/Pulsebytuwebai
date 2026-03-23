import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead } from '@/api/notifications/notificationsApi';
import { groupNotificationsByDay } from '../services/notifications.service';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(20),
    staleTime: 1000 * 60 * 5
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 1000 * 30
  });

  const markRead = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  const markAllRead = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
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
