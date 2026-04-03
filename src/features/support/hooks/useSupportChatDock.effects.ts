import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { userService, type UserRecord } from '@/features/auth/services/user.service';
import { ticketMessagesService } from '@/features/support/services/ticketMessages.service';
import { ticketService, type SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { TicketMessage } from '@/features/support/ticketMessages.types';
import {
  SUPPORT_CHAT_INTENT_EVENT,
  consumeSupportChatIntent,
  type SupportChatIntent,
  type SupportChatScope,
} from '@/features/support/supportChat.events';

const emptyTickets: SupportAdminTicketRecord[] = [];

function groupMessagesByTicketId(messages: TicketMessage[]) {
  return messages.reduce<Record<string, TicketMessage[]>>((accumulator, message) => {
    const currentMessages = accumulator[message.ticket_id] ?? [];
    accumulator[message.ticket_id] = [...currentMessages, message];
    return accumulator;
  }, {});
}

export function useSupportChatDockData(scope: SupportChatScope, userId: string | undefined) {
  const [tickets, setTickets] = useState<SupportAdminTicketRecord[]>(emptyTickets);
  const [messagesByTicketId, setMessagesByTicketId] = useState<Record<string, TicketMessage[]>>({});
  const [userMap, setUserMap] = useState<Record<string, UserRecord>>({});
  const [loading, setLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!userId) {
      setTickets(emptyTickets);
      setMessagesByTicketId({});
      setUserMap({});
      return;
    }

    setLoading(true);

    try {
      const nextTickets =
        scope === 'admin' ? await ticketService.getTicketsByAssignee(userId) : await ticketService.getTicketsByClient(userId);
      const nextMessages = await ticketMessagesService.getByTicketIds(nextTickets.map((ticket) => ticket.id));
      const identityIds = Array.from(
        new Set(
          [
            ...nextTickets.map((ticket) => ticket.user_id),
            ...nextTickets.map((ticket) => ticket.assigned_admin_id),
            ...nextMessages.map((message) => message.sender_id),
          ].filter((id): id is string => typeof id === 'string' && id.length > 0),
        ),
      );
      const identities = await Promise.all(identityIds.map(async (id) => [id, await userService.getUserById(id)] as const));
      setTickets(nextTickets);
      setMessagesByTicketId(groupMessagesByTicketId(nextMessages));
      setUserMap(
        identities.reduce<Record<string, UserRecord>>((accumulator, [id, profile]) => {
          if (profile) {
            accumulator[id] = profile;
          }

          return accumulator;
        }, {}),
      );
    } catch (error) {
      console.error('Error cargando tickets del chat:', error);
      toast({
        title: 'No pudimos abrir el chat',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [scope, userId]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const filter = scope === 'admin' ? `assigned_admin_id=eq.${userId}` : `user_id=eq.${userId}`;
    const channel = supabase
      .channel(`support-chat-${scope}-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter }, () => void loadTickets())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTickets, scope, userId]);

  return {
    loading,
    loadTickets,
    messagesByTicketId,
    setMessagesByTicketId,
    tickets,
    userMap,
  };
}

export function useSupportChatReadState({
  open,
  scope,
  selectedMessages,
  selectedTicket,
  setMessagesByTicketId,
  userId,
}: {
  open: boolean;
  scope: SupportChatScope;
  selectedMessages: TicketMessage[];
  selectedTicket: SupportAdminTicketRecord | null;
  setMessagesByTicketId: Dispatch<SetStateAction<Record<string, TicketMessage[]>>>;
  userId: string | undefined;
}) {
  useEffect(() => {
    if (!open || !selectedTicket || !userId) {
      return;
    }

    const counterpartRole = scope === 'admin' ? 'client' : 'admin';
    const hasUnreadMessages = selectedMessages.some((message) => message.sender_role === counterpartRole && !message.is_read);

    if (!hasUnreadMessages) {
      return;
    }

    void (async () => {
      try {
        await ticketMessagesService.markAsRead({
          ticketId: selectedTicket.id,
          viewerRole: scope === 'admin' ? 'admin' : 'client',
        });

        setMessagesByTicketId((current) => ({
          ...current,
          [selectedTicket.id]: (current[selectedTicket.id] ?? []).map((message) =>
            message.sender_role === counterpartRole ? { ...message, is_read: true, read_at: message.read_at ?? new Date().toISOString() } : message,
          ),
        }));
      } catch (error) {
        console.error('Error marcando mensajes como leidos:', error);
      }
    })();
  }, [open, scope, selectedMessages, selectedTicket, setMessagesByTicketId, userId]);
}

export function useSupportChatDockIntents({
  scope,
  selectTicket,
  setFocusNonce,
  setOpen,
}: {
  scope: SupportChatScope;
  selectTicket: (ticketId: string | null) => void;
  setFocusNonce: Dispatch<SetStateAction<number>>;
  setOpen: (value: boolean) => void;
}) {
  useEffect(() => {
    const applyIntent = (intent: SupportChatIntent | null) => {
      if (!intent || intent.scope !== scope) {
        return;
      }

      selectTicket(intent.ticketId ?? null);
      setOpen(true);

      if (intent.focusInput) {
        setFocusNonce((current) => current + 1);
      }
    };

    applyIntent(consumeSupportChatIntent());

    const handleIntent = (event: Event) => {
      applyIntent((event as CustomEvent<SupportChatIntent>).detail ?? null);
    };

    window.addEventListener(SUPPORT_CHAT_INTENT_EVENT, handleIntent);
    return () => window.removeEventListener(SUPPORT_CHAT_INTENT_EVENT, handleIntent);
  }, [scope, selectTicket, setFocusNonce, setOpen]);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const ticketId = currentUrl.searchParams.get('ticket');
    const focusInput = currentUrl.searchParams.get('focusInput') === '1';

    if (!ticketId) {
      return;
    }

    selectTicket(ticketId);
    setOpen(true);

    if (focusInput) {
      setFocusNonce((current) => current + 1);
    }

    currentUrl.searchParams.delete('ticket');
    currentUrl.searchParams.delete('focusInput');
    window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }, [selectTicket, setFocusNonce, setOpen]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const payload =
        event.data?.type === 'PULSE_PUSH_OPEN' && event.data?.payload && typeof event.data.payload === 'object'
          ? (event.data.payload as Record<string, unknown>)
          : null;

      if (!payload) {
        return;
      }

      const ticketId = typeof payload.ticketId === 'string' ? payload.ticketId : null;

      if (!ticketId) {
        return;
      }

      const intent: SupportChatIntent = { scope, ticketId, focusInput: true };
      selectTicket(ticketId);
      setOpen(true);
      setFocusNonce((current) => current + 1);
      window.dispatchEvent(new CustomEvent(SUPPORT_CHAT_INTENT_EVENT, { detail: intent }));
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
  }, [scope, selectTicket, setFocusNonce, setOpen]);
}
