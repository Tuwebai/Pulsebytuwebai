import { ticketService } from '@/features/support/services/ticket.service';
import type { AdminTicket, TicketFormData } from '@/features/admin/tickets/types/adminTicket.types';

export async function saveAdminTicket({
  currentUserEmail,
  editingTicket,
  formData,
}: {
  currentUserEmail: string | null;
  editingTicket: AdminTicket | null;
  formData: TicketFormData;
}) {
  if (editingTicket) {
    await ticketService.updateTicket(editingTicket.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      category: formData.category,
      assigned_to: formData.assignedTo,
    });
    return;
  }

  await ticketService.createTicket({
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    status: formData.status,
    user_id: null,
    email: currentUserEmail ?? 'admin@pulse.local',
    assigned_to: formData.assignedTo,
    category: formData.category,
  });
}

export async function sendAdminTicketResponse({
  responder,
  responseText,
  ticketId,
}: {
  responder: string;
  responseText: string;
  ticketId: string;
}) {
  const responseDate = new Date().toISOString();

  await ticketService.updateTicket(ticketId, {
    respuesta: responseText,
    respondido_por: responder,
    fecha_respuesta: responseDate,
    estado: 'respondido',
  });

  return responseDate;
}

export async function removeAdminTicket(ticketId: string) {
  await ticketService.deleteTicket(ticketId);
}

export async function changeAdminTicketStatus(ticketId: string, newStatus: string) {
  await ticketService.updateTicket(ticketId, { status: newStatus });
}
