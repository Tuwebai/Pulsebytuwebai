import { useCallback, useMemo, useState } from 'react';
import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import type { SupportDraftState } from '@/features/support';
import { buildSupportConversationSummary } from '@/features/support/services/ticketMessages.service';
import { type SupportConversationSummary } from '@/features/support/ticketMessages.types';
import {
  MAX_CLIENT_CONSECUTIVE_MESSAGES,
  canClientSendMessage,
  getClientConsecutiveMessages,
} from '@/features/support/hooks/useSupportChatDock.business';
import {
  useSupportChatDockData,
  useSupportChatDockIntents,
  useSupportChatReadState,
} from '@/features/support/hooks/useSupportChatDock.effects';
import { createSupportChatTicket, submitSupportChatReply } from '@/features/support/hooks/useSupportChatDock.actions';
import { buildConversationIdentity } from '@/features/support/hooks/supportChatIdentity.utils';
import { type SupportChatScope } from '@/features/support/supportChat.events';
import {
  canReplyToSupportTicket,
  resolveDefaultSupportTicket,
  resolveSupportPendingCount,
} from '@/features/support/supportChat.utils';

const SUPPORT_DRAFT_INITIAL_STATE: SupportDraftState = {
  title: '',
  description: '',
  priority: 'medium',
};

export function useSupportChatDock(scope: SupportChatScope) {
  const { user } = useApp();
  const [responseText, setResponseText] = useState('');
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const [draft, setDraft] = useSessionStorageState<SupportDraftState>(
    `pulse:support-chat:${scope}:${user?.id ?? 'anon'}:draft`,
    SUPPORT_DRAFT_INITIAL_STATE,
  );
  const [open, setOpen] = useSessionStorageState(`pulse:support-chat:${scope}:${user?.id ?? 'anon'}:open`, false);
  const [selectedTicketId, setSelectedTicketId] = useSessionStorageState<string | null>(
    `pulse:support-chat:${scope}:${user?.id ?? 'anon'}:ticket`,
    null,
  );
  const { loading, loadTickets, messagesByTicketId, setMessagesByTicketId, tickets, userMap } = useSupportChatDockData(scope, user?.id);

  const selectedTicket = useMemo(
    () => {
      if (!selectedTicketId) {
        return null;
      }

      return tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
    },
    [selectedTicketId, tickets],
  );
  const selectedMessages = useMemo(
    () => (selectedTicket ? messagesByTicketId[selectedTicket.id] ?? [] : []),
    [messagesByTicketId, selectedTicket],
  );
  const conversationSummaries = useMemo<SupportConversationSummary[]>(
    () =>
      tickets
        .map((ticket) => {
          const summary = buildSupportConversationSummary({
            ticket,
            messages: messagesByTicketId[ticket.id] ?? [],
            viewerRole: scope === 'admin' ? 'admin' : 'client',
          });

          return buildConversationIdentity({
            scope,
            summary,
            ticket,
            userMap,
          });
        })
        .sort((left, right) => new Date(right.lastMessageAt ?? 0).getTime() - new Date(left.lastMessageAt ?? 0).getTime()),
    [messagesByTicketId, scope, tickets, userMap],
  );
  const selectedConversation = useMemo(
    () => conversationSummaries.find((conversation) => conversation.ticketId === selectedTicket?.id) ?? null,
    [conversationSummaries, selectedTicket?.id],
  );
  const selectTicket = useCallback(
    (ticketId: string | null) => {
      setCreateTicketOpen(false);
      setSelectedTicketId(ticketId);
    },
    [setSelectedTicketId],
  );
  const canReply = canReplyToSupportTicket(selectedTicket, scope, user?.id);
  const canClientSend = useMemo(() => (scope === 'client' ? canClientSendMessage(selectedMessages) : true), [scope, selectedMessages]);
  const clientRemainingMessages = useMemo(
    () => Math.max(MAX_CLIENT_CONSECUTIVE_MESSAGES - getClientConsecutiveMessages(selectedMessages), 0),
    [selectedMessages],
  );
  const pendingCount = useMemo(() => {
    if (scope === 'client') {
      return conversationSummaries.reduce((total, conversation) => total + conversation.unreadCount, 0);
    }

    return resolveSupportPendingCount(tickets, scope, user?.id);
  }, [conversationSummaries, scope, tickets, user?.id]);

  useSupportChatReadState({
    open,
    scope,
    selectedMessages,
    selectedTicket,
    setMessagesByTicketId,
    userId: user?.id,
  });
  useSupportChatDockIntents({
    scope,
    selectTicket,
    setFocusNonce,
    setOpen,
  });

  const openConversation = useCallback(() => {
    selectTicket(selectedTicketId ?? resolveDefaultSupportTicket(tickets, scope, user?.id)?.id ?? null);
    setCreateTicketOpen(false);
    setOpen(true);
    setFocusNonce((current) => current + 1);
  }, [scope, selectTicket, selectedTicketId, setOpen, tickets, user?.id]);

  const closeConversation = useCallback(() => {
    setOpen(false);
    setCreateTicketOpen(false);
    setResponseText('');
  }, [setOpen]);

  const openNewTicketComposer = useCallback(() => {
    selectTicket(null);
    setCreateTicketOpen(true);
    setOpen(true);
  }, [selectTicket, setOpen]);

  const submitReply = useCallback(async () => {
    try {
      const sent = await submitSupportChatReply({
        canClientSend,
        canReply,
        loadTickets,
        responseText,
        scope,
        selectedTicket,
        user,
      });

      if (!sent) {
        return;
      }

      setResponseText('');
      setOpen(true);
    } catch (error) {
      console.error('Error respondiendo ticket desde burbuja:', error);
      toast({
        title: 'No pudimos enviar tu mensaje',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }, [canClientSend, canReply, loadTickets, responseText, scope, selectedTicket, setOpen, user]);

  const createTicket = useCallback(async () => {
    try {
      const ticket = await createSupportChatTicket({
        draft,
        loadTickets,
        scope,
        user,
      });

      if (!ticket) {
        return;
      }

      setDraft(SUPPORT_DRAFT_INITIAL_STATE);
      selectTicket(ticket.id);
      setOpen(true);
    } catch (error) {
      console.error('Error creando ticket desde el chat:', error);
      toast({
        title: 'No pudimos abrir el ticket',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }, [draft, loadTickets, scope, selectTicket, setDraft, setOpen, user]);

  return {
    canClientSend,
    canReply,
    clientRemainingMessages,
    closeConversation,
    conversationSummaries,
    createTicket,
    createTicketOpen,
    draft,
    focusNonce,
    loading,
    open,
    openConversation,
    openNewTicketComposer,
    pendingCount,
    responseText,
    selectedConversation,
    selectedMessages,
    selectedTicket,
    setDraft,
    setSelectedTicketId: selectTicket,
    setResponseText,
    submitReply,
    tickets,
  };
}
