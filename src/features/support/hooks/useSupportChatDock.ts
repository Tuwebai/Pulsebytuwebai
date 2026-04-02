import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { ticketService } from '@/features/support/services/ticket.service';
import {
  SUPPORT_CHAT_INTENT_EVENT,
  consumeSupportChatIntent,
  type SupportChatIntent,
  type SupportChatScope,
} from '@/features/support/supportChat.events';
import {
  canReplyToSupportTicket,
  resolveDefaultSupportTicket,
  resolveSupportPendingCount,
} from '@/features/support/supportChat.utils';

const emptyTickets: Awaited<ReturnType<typeof ticketService.getTickets>> = [];

export function useSupportChatDock(scope: SupportChatScope) {
  const { user } = useApp();
  const [tickets, setTickets] = useState(emptyTickets);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [focusNonce, setFocusNonce] = useState(0);
  const [open, setOpen] = useSessionStorageState(`pulse:support-chat:${scope}:${user?.id ?? 'anon'}:open`, false);
  const [selectedTicketId, setSelectedTicketId] = useSessionStorageState<string | null>(
    `pulse:support-chat:${scope}:${user?.id ?? 'anon'}:ticket`,
    null,
  );
  const selectedTicketIdRef = useRef<string | null>(selectedTicketId);
  selectedTicketIdRef.current = selectedTicketId;

  const loadTickets = useCallback(async () => {
    if (!user?.id) {
      setTickets(emptyTickets);
      return;
    }

    setLoading(true);

    try {
      const nextTickets =
        scope === 'admin' ? await ticketService.getTickets() : await ticketService.getTicketsByClient(user.id);
      setTickets(nextTickets);
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
  }, [scope, user?.id]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const filter = scope === 'admin' ? undefined : `user_id=eq.${user.id}`;
    const channel = supabase
      .channel(`support-chat-${scope}-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter }, () => void loadTickets())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTickets, scope, user?.id]);

  const selectedTicket = useMemo(
    () =>
      tickets.find((ticket) => ticket.id === selectedTicketId) ??
      resolveDefaultSupportTicket(tickets, scope, user?.id) ??
      null,
    [scope, selectedTicketId, tickets, user?.id],
  );
  const pendingCount = useMemo(() => resolveSupportPendingCount(tickets, scope, user?.id), [scope, tickets, user?.id]);
  const canReply = canReplyToSupportTicket(selectedTicket, scope, user?.id);

  useEffect(() => {
    const applyIntent = (intent: SupportChatIntent | null) => {
      if (!intent || intent.scope !== scope) {
        return;
      }

      setSelectedTicketId(intent.ticketId ?? selectedTicketIdRef.current);
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
  }, [scope, setOpen, setSelectedTicketId]);

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

      const nextScope: SupportChatScope = scope;
      const intent: SupportChatIntent = { scope: nextScope, ticketId, focusInput: true };
      setSelectedTicketId(ticketId);
      setOpen(true);
      setFocusNonce((current) => current + 1);
      window.dispatchEvent(new CustomEvent(SUPPORT_CHAT_INTENT_EVENT, { detail: intent }));
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
  }, [scope, setOpen, setSelectedTicketId]);

  const openConversation = useCallback(() => {
    setSelectedTicketId((current) => current ?? resolveDefaultSupportTicket(tickets, scope, user?.id)?.id ?? null);
    setOpen(true);
    setFocusNonce((current) => current + 1);
  }, [scope, setOpen, setSelectedTicketId, tickets, user?.id]);

  const closeConversation = useCallback(() => {
    setOpen(false);
    setResponseText('');
  }, [setOpen]);

  const submitReply = useCallback(async () => {
    if (!selectedTicket || !responseText.trim()) {
      return;
    }

    const now = new Date().toISOString();

    try {
      if (scope === 'admin') {
        if (!canReply) {
          toast({
            title: 'Este ticket ya tiene responsable',
            description: 'Continua desde la bandeja del admin asignado.',
            variant: 'destructive',
          });
          return;
        }

        await ticketService.updateTicket(selectedTicket.id, {
          assigned_admin_id: user?.id ?? selectedTicket.assigned_admin_id ?? null,
          respuesta: responseText,
          respondido_por: user?.full_name || user?.email || 'Equipo Pulse',
          fecha_respuesta: now,
          status: 'in_conversation',
        });
      } else {
        await ticketService.updateTicket(selectedTicket.id, {
          respuesta_cliente: responseText,
          fecha_respuesta_cliente: now,
          status: 'in_conversation',
        });
      }

      setResponseText('');
      setOpen(true);
      await loadTickets();
    } catch (error) {
      console.error('Error respondiendo ticket desde burbuja:', error);
      toast({
        title: 'No pudimos enviar tu mensaje',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }, [canReply, loadTickets, responseText, scope, selectedTicket, setOpen, user?.email, user?.full_name, user?.id]);

  return {
    canReply,
    closeConversation,
    focusNonce,
    loading,
    open,
    openConversation,
    pendingCount,
    responseText,
    selectedTicket,
    setResponseText,
    submitReply,
  };
}
