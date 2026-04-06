import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { supabase } from '@/data/supabase/client';
import { ticketMessagesService } from '@/features/support/services/ticketMessages.service';
import type { TicketMessage } from '@/features/support/ticketMessages.types';

interface UseSupportChatMessagesRealtimeParams {
  ticketIds: string[];
  userId: string | undefined;
  setMessagesByTicketId: Dispatch<SetStateAction<Record<string, TicketMessage[]>>>;
}

export function useSupportChatMessagesRealtime({
  ticketIds,
  userId,
  setMessagesByTicketId,
}: UseSupportChatMessagesRealtimeParams) {
  useEffect(() => {
    if (!userId || ticketIds.length === 0) {
      return;
    }

    const filter = `ticket_id=in.(${ticketIds.join(',')})`;
    const channel = supabase
      .channel(`support-chat-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_messages', filter },
        (payload) => {
          const nextRow =
            payload.new && typeof payload.new === 'object' ? (payload.new as Record<string, unknown>) : null;
          const previousRow =
            payload.old && typeof payload.old === 'object' ? (payload.old as Record<string, unknown>) : null;
          const ticketId =
            typeof nextRow?.ticket_id === 'string'
              ? nextRow.ticket_id
              : typeof previousRow?.ticket_id === 'string'
                ? previousRow.ticket_id
                : null;

          if (!ticketId) {
            return;
          }

          void (async () => {
            try {
              const messages = await ticketMessagesService.getByTicketId(ticketId);
              setMessagesByTicketId((current) => ({
                ...current,
                [ticketId]: messages,
              }));
            } catch (error) {
              console.error('Error sincronizando mensajes del chat:', error);
            }
          })();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [setMessagesByTicketId, ticketIds, userId]);
}
