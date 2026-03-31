import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { useApp } from '@/contexts/AppContext';
import { sendSupportTicketEmail, sendTicketConfirmationEmail } from '@/lib/services/emailService';
import type { SupportDraftState, Ticket } from '@/features/support';
import { mapSupportPriorityToEmailPriority } from '@/features/support/support.utils';

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
      const { data, error: ticketsError } = await supabase.from('tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (ticketsError) throw ticketsError;
      setTickets((data ?? []) as Ticket[]);
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
        const timestamp = new Date().toISOString();
        const newTicket = {
          title: formData.title,
          description: formData.description,
          status: 'open' as const,
          priority: formData.priority,
          user_id: user.id,
          created_at: timestamp,
          updated_at: timestamp,
        };

        const { data: ticketData, error: ticketError } = await supabase.from('tickets').insert(newTicket).select().single();
        if (ticketError) throw ticketError;

        await sendTicketConfirmationEmail({
          email: user.email,
          ticketId: ticketData.id,
          asunto: formData.title,
          mensaje: formData.description,
          prioridad: mapSupportPriorityToEmailPriority(formData.priority),
          fecha: timestamp,
        });

        await sendSupportTicketEmail({
          asunto: formData.title,
          mensaje: formData.description,
          email: user.email,
          prioridad: mapSupportPriorityToEmailPriority(formData.priority),
          fecha: timestamp,
        });

        setTickets((previous) => [ticketData as Ticket, ...previous]);
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
      const responseDate = new Date().toISOString();
      const patch = {
        respuesta_cliente: responseText,
        fecha_respuesta_cliente: responseDate,
        status: 'in_conversation' as const,
        updated_at: responseDate,
      };

      const { error: responseError } = await supabase.from('tickets').update(patch).eq('id', respondingTicket.id);
      if (responseError) throw responseError;

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
    closedTickets: tickets.filter((ticket) => ticket.status === 'closed').length,
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
