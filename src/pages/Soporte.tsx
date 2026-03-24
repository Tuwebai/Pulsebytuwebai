import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { useApp } from '@/contexts/AppContext';
import { sendSupportTicketEmail, sendTicketConfirmationEmail } from '@/lib/emailService';
import {
  SupportContactPanel,
  SupportResponseModal,
  SupportSummaryRow,
  SupportTicketForm,
  SupportTicketsPanel,
  type SupportDraftState,
  type Ticket
} from '@/features/support';

const SUPPORT_DRAFT_INITIAL_STATE: SupportDraftState = {
  title: '',
  description: '',
  priority: 'medium'
};

export default function Soporte() {
  const { user, getUserProjects } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useSessionStorageState<SupportDraftState>(
    `pulse:soporte:${user?.id ?? 'anon'}:new-ticket-draft`,
    SUPPORT_DRAFT_INITIAL_STATE
  );
  const [respondingTicketId, setRespondingTicketId] = useSessionStorageState<string | null>(
    `pulse:soporte:${user?.id ?? 'anon'}:responding-ticket-id`,
    null
  );
  const [responseText, setResponseText] = useSessionStorageState(`pulse:soporte:${user?.id ?? 'anon'}:response-draft`, '');

  const respondingTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === respondingTicketId) ?? null,
    [respondingTicketId, tickets]
  );

  const loadTickets = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        throw ticketsError;
      }

      setTickets((ticketsData ?? []) as Ticket[]);
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

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmitTicket = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Ticket enviado', description: 'Tu ticket de soporte fue enviado. Procesando en segundo plano...' });
    setFormData(SUPPORT_DRAFT_INITIAL_STATE);

    void (async () => {
      try {
        const newTicket = {
          title: formData.title,
          description: formData.description,
          status: 'open' as const,
          priority: formData.priority,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: ticketData, error: ticketError } = await supabase.from('tickets').insert(newTicket).select().single();

        if (ticketError) {
          throw ticketError;
        }

        await sendTicketConfirmationEmail({
          email: user.email,
          ticketId: ticketData.id,
          asunto: formData.title,
          mensaje: formData.description,
          prioridad: formData.priority,
          fecha: new Date().toISOString()
        });

        await sendSupportTicketEmail({
          asunto: formData.title,
          mensaje: formData.description,
          email: user.email,
          prioridad: formData.priority,
          fecha: new Date().toISOString()
        });

        setTickets((previous) => [ticketData as Ticket, ...previous]);
        setError(null);
        toast({ title: 'Ticket procesado', description: 'Tu ticket ha sido procesado correctamente.' });
      } catch (submitError) {
        console.error('Error procesando ticket:', submitError);
        toast({
          title: 'Error',
          description: 'Hubo un problema procesando tu ticket. Contacta al equipo de soporte.',
          variant: 'destructive'
        });
      }
    })();
  };

  const handleClientResponse = async () => {
    if (!respondingTicket || !responseText.trim()) {
      return;
    }

    try {
      const responseDate = new Date().toISOString();

      const { error: responseError } = await supabase
        .from('tickets')
        .update({
          respuesta_cliente: responseText,
          fecha_respuesta_cliente: responseDate,
          status: 'in_conversation',
          updated_at: responseDate
        })
        .eq('id', respondingTicket.id);

      if (responseError) {
        throw responseError;
      }

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === respondingTicket.id
            ? {
                ...ticket,
                respuesta_cliente: responseText,
                fecha_respuesta_cliente: responseDate,
                status: 'in_conversation',
                updated_at: responseDate
              }
            : ticket
        )
      );

      toast({
        title: 'Respuesta enviada',
        description: 'Tu respuesta se ha enviado correctamente',
        variant: 'default'
      });

      setRespondingTicketId(null);
      setResponseText('');
    } catch (responseError) {
      console.error('Error sending response:', responseError);
      toast({
        title: 'Error',
        description: 'Error al enviar la respuesta',
        variant: 'destructive'
      });
    }
  };

  const handleRetryLoad = () => {
    setError(null);
    setLoading(true);
    setTickets([]);
    void loadTickets();
  };

  const openTickets = tickets.filter((ticket) => ticket.status === 'open').length;
  const progressTickets = tickets.filter((ticket) => ticket.status === 'responded' || ticket.status === 'in_conversation').length;
  const closedTickets = tickets.filter((ticket) => ticket.status === 'closed').length;

  return (
    <>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-tour="support-header">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Soporte</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Hacé seguimiento de tus consultas y mantené la conversación con el equipo en un solo lugar.
            </p>
          </div>
        </section>

        <div data-tour="support-summary">
          <SupportSummaryRow closedCount={closedTickets} openCount={openTickets} progressCount={progressTickets} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div data-tour="support-contact">
            <SupportContactPanel projectsCount={getUserProjects().length} />
          </div>
          <div data-tour="support-form">
            <SupportTicketForm formData={formData} onChange={setFormData} onSubmit={handleSubmitTicket} />
          </div>
        </div>

        <div data-tour="support-tickets">
          <SupportTicketsPanel
            error={error}
            loading={loading}
            tickets={tickets}
            userEmail={user.email}
            onReply={setRespondingTicketId}
            onRetry={handleRetryLoad}
          />
        </div>
      </div>

      <SupportResponseModal
        responseText={responseText}
        ticket={respondingTicket}
        onChange={setResponseText}
        onClose={() => {
          setRespondingTicketId(null);
          setResponseText('');
        }}
        onSubmit={() => {
          void handleClientResponse();
        }}
      />
    </>
  );
}
