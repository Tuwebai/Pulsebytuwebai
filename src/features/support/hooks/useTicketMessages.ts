import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase/supabase';
import { ticketMessagesService } from '@/features/support/services/ticketMessages.service';
import type { TicketMessage } from '@/features/support/ticketMessages.types';

export function useTicketMessages(ticketId: string | null) {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const messagesQueryKey = useMemo(() => ['ticket-messages', ticketId], [ticketId]);
  const unreadCountQueryKey = useMemo(() => ['ticket-messages-unread-count', user?.id], [user?.id]);

  const messagesQuery = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () => ticketMessagesService.getByTicketId(ticketId ?? ''),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
  });

  const unreadCountQuery = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: () => ticketMessagesService.countUnreadForClient(user?.id ?? ''),
    enabled: Boolean(user?.id && user.role !== 'admin'),
    staleTime: 1000 * 30,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!ticketId || !user) {
        throw new Error('No hay contexto suficiente para enviar el mensaje.');
      }

      return ticketMessagesService.send({
        content,
        ticketId,
        user,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messagesQueryKey });
      void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async () => {
      if (!ticketId || !user) {
        throw new Error('No hay contexto suficiente para marcar mensajes como leídos.');
      }

      await ticketMessagesService.markAsRead({
        ticketId,
        viewerRole: user.role === 'admin' ? 'admin' : 'client',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messagesQueryKey });
      void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    const channel = supabase
      .channel(`ticket-messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const incoming: TicketMessage = {
            content: String(row.content ?? ''),
            created_at: String(row.created_at ?? ''),
            id: String(row.id ?? ''),
            is_read: Boolean(row.is_read),
            read_at: typeof row.read_at === 'string' ? row.read_at : null,
            sender: null,
            sender_id: String(row.sender_id ?? ''),
            sender_role: row.sender_role === 'admin' ? 'admin' : 'client',
            ticket_id: String(row.ticket_id ?? ''),
          };

          queryClient.setQueryData<TicketMessage[]>(messagesQueryKey, (current) => {
            const currentMessages = current ?? [];
            const alreadyExists = currentMessages.some((message) => message.id === incoming.id);

            if (alreadyExists) {
              return currentMessages;
            }

            return [...currentMessages, incoming];
          });

          void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: messagesQueryKey });
          void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [messagesQueryKey, queryClient, ticketId, unreadCountQueryKey]);

  useEffect(() => {
    if (!user?.id || user.role === 'admin') {
      return;
    }

    const channel = supabase
      .channel(`ticket-messages-unread-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, unreadCountQueryKey, user?.id, user?.role]);

  return {
    isLoading: messagesQuery.isLoading,
    markAsRead: markAsRead.mutateAsync,
    messages: messagesQuery.data ?? [],
    sendMessage: sendMessage.mutateAsync,
    unreadCount: unreadCountQuery.data ?? 0,
  };
}
