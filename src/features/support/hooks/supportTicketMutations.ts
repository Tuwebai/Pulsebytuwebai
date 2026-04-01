import { sendSupportTicketEmail, sendTicketConfirmationEmail } from '@/lib/services/emailService';
import { ticketService } from '@/features/support/services/ticket.service';
import { mapSupportPriorityToEmailPriority } from '@/features/support/support.utils';
import type { SupportDraftState, Ticket } from '@/features/support';

export async function submitSupportTicket({
  draft,
  user,
}: {
  draft: SupportDraftState;
  user: { email: string; id: string };
}): Promise<Ticket> {
  const timestamp = new Date().toISOString();
  const ticketData = await ticketService.createTicket({
    title: draft.title,
    description: draft.description,
    priority: draft.priority,
    status: 'open',
    user_id: user.id,
    email: user.email,
    fecha: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  });

  await sendTicketConfirmationEmail({
    email: user.email,
    ticketId: ticketData.id,
    asunto: draft.title,
    mensaje: draft.description,
    prioridad: mapSupportPriorityToEmailPriority(draft.priority),
    fecha: timestamp,
  });

  await sendSupportTicketEmail({
    asunto: draft.title,
    mensaje: draft.description,
    email: user.email,
    prioridad: mapSupportPriorityToEmailPriority(draft.priority),
    fecha: timestamp,
  });

  return ticketData as Ticket;
}

export async function submitSupportTicketReply({
  responseText,
  ticketId,
}: {
  responseText: string;
  ticketId: string;
}) {
  const responseDate = new Date().toISOString();
  const patch = {
    respuesta_cliente: responseText,
    fecha_respuesta_cliente: responseDate,
    status: 'in_conversation' as const,
    updated_at: responseDate,
  };

  await ticketService.updateTicket(ticketId, patch);
  return patch;
}
