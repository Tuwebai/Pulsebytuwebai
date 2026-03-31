import type { Dispatch, SetStateAction } from 'react';

import { useApp } from '@/contexts/AppContext';
import type { AdminTicket, TicketFormData } from '@/features/admin/tickets/types/adminTicket.types';
import { ticketService } from '@/features/support/services/ticket.service';
import { toast } from '@/hooks/use-toast';

interface UseAdminTicketMutationsParams {
  editingTicket: AdminTicket | null;
  formData: TicketFormData;
  refreshTickets: () => Promise<void>;
  responseText: string;
  respondingTicket: AdminTicket | null;
  setTickets: Dispatch<SetStateAction<AdminTicket[]>>;
}

export function useAdminTicketMutations({
  editingTicket,
  formData,
  refreshTickets,
  responseText,
  respondingTicket,
  setTickets,
}: UseAdminTicketMutationsParams) {
  const { user } = useApp();

  async function submitTicket() {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Completá los campos principales',
        description: 'El título y la descripción son obligatorios.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      if (editingTicket) {
        await ticketService.updateTicket(editingTicket.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          category: formData.category,
          assigned_to: formData.assignedTo,
        });
      } else {
        await ticketService.createTicket({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          user_id: user?.email || '',
          assigned_to: formData.assignedTo,
          category: formData.category,
        });
      }

      toast({
        title: editingTicket ? 'Ticket actualizado' : 'Ticket creado',
        description: 'El cambio quedó guardado correctamente.',
      });

      await refreshTickets();
      return true;
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast({
        title: 'No pudimos guardar el ticket',
        description: 'Revisá los datos e intentá de nuevo.',
        variant: 'destructive',
      });
      return false;
    }
  }

  async function submitResponse() {
    if (!respondingTicket || !responseText.trim()) {
      return false;
    }

    try {
      const responder = user?.full_name || user?.email || 'Admin';
      const responseDate = new Date().toISOString();

      await ticketService.updateTicket(respondingTicket.id, {
        respuesta: responseText,
        respondido_por: responder,
        fecha_respuesta: responseDate,
        estado: 'respondido',
      });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === respondingTicket.id
            ? {
                ...ticket,
                respuesta: responseText,
                respondido_por: responder,
                fecha_respuesta: responseDate,
                estado: 'respondido',
              }
            : ticket,
        ),
      );

      toast({ title: 'Respuesta enviada', description: 'El cliente ya puede verla.' });
      return true;
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: 'No pudimos enviar la respuesta',
        description: 'Volvé a intentar en unos segundos.',
        variant: 'destructive',
      });
      return false;
    }
  }

  async function deleteTicket(ticketId: string) {
    try {
      await ticketService.deleteTicket(ticketId);
      setTickets((currentTickets) => currentTickets.filter((ticket) => ticket.id !== ticketId));
      toast({ title: 'Ticket eliminado', description: 'El registro salió de la bandeja.' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'No pudimos eliminar el ticket',
        description: 'Volvé a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    try {
      await ticketService.updateTicket(ticketId, { estado: newStatus });
      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, estado: newStatus } : ticket,
        ),
      );
      toast({ title: 'Estado actualizado', description: 'La bandeja ya quedó sincronizada.' });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'No pudimos actualizar el estado',
        description: 'Volvé a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }

  return {
    deleteTicket,
    submitResponse,
    submitTicket,
    updateTicketStatus,
  };
}
