import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/data/types/notifications';
import { playPulseNotificationSound } from '@/lib/audio/notificationSound';
import { supabase } from '@/lib/supabase/supabase';
import { showForegroundNotification } from '../services/browserNotifications.service';
import { notificationQueryKeys } from './notificationQueryKeys';

interface RealtimeNotificationRow {
  action_url?: string | null;
  category?: string | null;
  created_at?: string | null;
  id: string;
  is_read?: boolean | null;
  is_urgent?: boolean | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  title: string;
  type?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
}

function normalizeRealtimeType(type: string | null | undefined): Notification['type'] {
  if (type === 'success' || type === 'warning' || type === 'error' || type === 'critical') {
    return type;
  }

  return 'info';
}

function normalizeRealtimeCategory(category: string | null | undefined): Notification['category'] {
  if (
    category === 'project' ||
    category === 'ticket' ||
    category === 'payment' ||
    category === 'security' ||
    category === 'user'
  ) {
    return category;
  }

  return 'system';
}

function mapRealtimeNotification(row: RealtimeNotificationRow): Notification {
  return {
    id: row.id,
    user_id: row.user_id ?? '',
    title: row.title,
    message: row.message ?? null,
    type: normalizeRealtimeType(row.type),
    category: normalizeRealtimeCategory(row.category),
    is_read: Boolean(row.is_read),
    is_urgent: Boolean(row.is_urgent),
    metadata: row.metadata ?? null,
    action_url: row.action_url ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? null,
  };
}

function shouldPlayRealtimeNotificationSound() {
  return typeof document !== 'undefined' && document.visibilityState === 'visible';
}

export function useNotificationsRealtime(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return;
    }

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const insertedNotification = mapRealtimeNotification(payload.new as RealtimeNotificationRow);

            if (shouldPlayRealtimeNotificationSound()) {
              playPulseNotificationSound();
            }

            void showForegroundNotification(payload.new as RealtimeNotificationRow);
            queryClient.setQueryData<Notification[]>(notificationQueryKeys.list(userId), (current = []) => {
              const withoutDuplicate = current.filter((notification) => notification.id !== insertedNotification.id);
              return [insertedNotification, ...withoutDuplicate].slice(0, 20);
            });
            queryClient.setQueryData<number>(notificationQueryKeys.unreadCount(userId), (current = 0) =>
              insertedNotification.is_read ? current : current + 1,
            );
            return;
          }

          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedNotification = mapRealtimeNotification(payload.new as RealtimeNotificationRow);

            queryClient.setQueryData<Notification[]>(notificationQueryKeys.list(userId), (current = []) =>
              current.map((notification) =>
                notification.id === updatedNotification.id ? { ...notification, ...updatedNotification } : notification,
              ),
            );
            queryClient.setQueryData<number>(notificationQueryKeys.unreadCount(userId), (current = 0) => {
              const previousNotification = (payload.old as RealtimeNotificationRow | null) ?? null;
              const wasUnread = previousNotification?.is_read === false;
              const isUnread = updatedNotification.is_read === false;

              if (wasUnread === isUnread) {
                return current;
              }

              return isUnread ? current + 1 : Math.max(0, current - 1);
            });
            return;
          }

          void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(userId) });
          void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount(userId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
