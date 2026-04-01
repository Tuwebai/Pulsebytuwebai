import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { useApp } from '@/contexts/AppContext';
import { ticketService } from '@/features/support/services/ticket.service';
import { useSupportTicketsRealtime } from '@/features/support/hooks/useSupportTicketsRealtime';
import {
  submitSupportTicket,
  submitSupportTicketReply,
} from '@/features/support/hooks/supportTicketMutations';
import type { SupportDraftState, Ticket } from '@/features/support';

const SUPPORT_DRAFT_INITIAL_STATE: SupportDraftState = {
  title: '',
  description: '',
  priority: 'medium',
};

export function useSupportPage() {
  const { user, getUserProjects } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useSessionStorageState<SupportDraftState>(
    `pulse:soporte:${user?.id ?? 'anon'}:new-ticket-draft`,
    SUPPORT_DRAFT_INITIAL_STATE,
  );
  const [respondingTicketId, setRespondingTicketId] = useSessionStorageState<string | null>(
    `pulse:soporte:${user?.id ?? 'anon'}:responding-ticket-id`,
    null,
  );
  const [responseText, setResponseText] = useSessionStorageState(`pulse:soporte:${user?.id ?? 'anon'}:response-draft`, '');

  const respondingTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === respondingTicketId) ?? null,
    [respondingTicketId, tickets],
  );

  const loadTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const data = await ticketService.getTicketsByClient(user.id);
      setTickets(data as Ticket[]);
      setError(null);
    } catch (fetchError) {
      console.error('Error cargando tickets:', fetchError);
      setError('No pudimos cargar tus tickets en este momento.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useSupportTicketsRealtime({
    enabled: Boolean(user?.id),
    onRefresh: () => {
      void loadTickets();
    },
    userId: user?.id ?? null,
  });

  const handleSubmitTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Ticket enviado', description: 'Tu ticket de soporte fue enviado. Procesando en segundo plano...' });
    setFormData(SUPPORT_DRAFT_INITIAL_STATE);

    void (async () => {
      try {
        const ticketData = await submitSupportTicket({ draft: formData, user });
        setTickets((previous) => [ticketData, ...previous]);
        setError(null);
        toast({ title: 'Ticket procesado', description: 'Tu ticket ha sido procesado correctamente.' });
      } catch (submitError) {
        console.error('Error procesando ticket:', submitError);
        toast({ title: 'Error', description: 'Hubo un problema procesando tu ticket. Contactá al equipo de soporte.', variant: 'destructive' });
      }
    })();
  };

  const handleClientResponse = async () => {
    if (!respondingTicket || !responseText.trim()) return;

    try {
      const patch = await submitSupportTicketReply({
        responseText,
        ticketId: respondingTicket.id,
      });
      setTickets((previous) => previous.map((ticket) => (ticket.id === respondingTicket.id ? { ...ticket, ...patch } : ticket)));
      toast({ title: 'Respuesta enviada', description: 'Tu respuesta se envió correctamente.', variant: 'default' });
      setRespondingTicketId(null);
      setResponseText('');
    } catch (responseError) {
      console.error('Error enviando respuesta:', responseError);
      toast({ title: 'Error', description: 'No pudimos enviar tu respuesta en este momento.', variant: 'destructive' });
    }
  };

  return {
    user,
    projectsCount: getUserProjects().length,
    tickets,
    loading,
    error,
    formData,
    respondingTicket,
    responseText,
    openTickets: tickets.filter((ticket) => ticket.status === 'open').length,
    progressTickets: tickets.filter((ticket) => ticket.status === 'responded' || ticket.status === 'in_conversation').length,
    closedTickets: tickets.filter((ticket) => ticket.status === 'closed' || ticket.status === 'resolved').length,
    setFormData,
    setRespondingTicketId,
    setResponseText,
    handleSubmitTicket,
    handleClientResponse,
    handleRetryLoad: () => {
      setError(null);
      setLoading(true);
      setTickets([]);
      void loadTickets();
    },
  };
}
