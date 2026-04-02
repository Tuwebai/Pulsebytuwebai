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
  });
}

export async function removeAdminTicket(ticketId: string) {
  await ticketService.deleteTicket(ticketId);
}

export async function changeAdminTicketStatus(ticketId: string, newStatus: string) {
  await ticketService.updateTicket(ticketId, { status: newStatus });
}

export async function takeAdminTicket({
  adminId,
  ticketId,
}: {
  adminId: string;
  ticketId: string;
}) {
  await ticketService.updateTicket(ticketId, {
    assigned_admin_id: adminId,
    status: 'in_conversation',
  });
}
