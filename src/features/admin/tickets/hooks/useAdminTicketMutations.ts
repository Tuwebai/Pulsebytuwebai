import type { Dispatch, SetStateAction } from 'react';
import { useApp } from '@/contexts/useApp';
import {
  changeAdminTicketStatus,
  removeAdminTicket,
  saveAdminTicket,
  takeAdminTicket,
} from '@/features/admin/tickets/hooks/adminTicketMutationActions';
import type { AdminTicket, TicketFormData } from '@/features/admin/tickets/types/adminTicket.types';
import { storeSupportChatIntent } from '@/features/support/supportChat.events';
import { toast } from '@/core/notifications/hooks/useToast';

interface UseAdminTicketMutationsParams {
  editingTicket: AdminTicket | null;
  formData: TicketFormData;
  refreshTickets: () => Promise<void>;
  setTickets: Dispatch<SetStateAction<AdminTicket[]>>;
}

export function useAdminTicketMutations({
  editingTicket,
  formData,
  refreshTickets,
  setTickets,
}: UseAdminTicketMutationsParams) {
  const { user } = useApp();

  async function submitTicket() {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Completa los campos principales',
        description: 'El titulo y la descripcion son obligatorios.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await saveAdminTicket({
        currentUserEmail: user?.email ?? null,
        editingTicket,
        formData,
      });

      toast({
        title: editingTicket ? 'Ticket actualizado' : 'Ticket creado',
        description: 'El cambio quedo guardado correctamente.',
      });
      await refreshTickets();
      return true;
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast({
        title: 'No pudimos guardar el ticket',
        description: 'Revisa los datos e intenta de nuevo.',
        variant: 'destructive',
      });
      return false;
    }
  }

  async function deleteTicket(ticketId: string) {
    try {
      await removeAdminTicket(ticketId);
      setTickets((currentTickets) => currentTickets.filter((ticket) => ticket.id !== ticketId));
      toast({ title: 'Ticket eliminado', description: 'El registro salio de la bandeja.' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'No pudimos eliminar el ticket',
        description: 'Vuelve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    try {
      await changeAdminTicketStatus(ticketId, newStatus);
      setTickets((currentTickets) =>
        currentTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)),
      );
      toast({ title: 'Estado actualizado', description: 'La bandeja ya quedo sincronizada.' });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'No pudimos actualizar el estado',
        description: 'Vuelve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }

  async function takeTicket(ticketId: string) {
    if (!user?.id) {
      return;
    }

    try {
      await takeAdminTicket({ adminId: user.id, ticketId });
      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, assigned_admin_id: user.id, status: 'in_conversation' } : ticket,
        ),
      );
      storeSupportChatIntent({
        scope: 'admin',
        ticketId,
        focusInput: true,
      });
      toast({ title: 'Ticket tomado', description: 'La conversacion ya quedo asignada a tu bandeja.' });
    } catch (error) {
      console.error('Error taking ticket:', error);
      toast({
        title: 'No pudimos tomar el ticket',
        description: 'Vuelve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }

  return {
    deleteTicket,
    submitTicket,
    takeTicket,
    updateTicketStatus,
  };
}
