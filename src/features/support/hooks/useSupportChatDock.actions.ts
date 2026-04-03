import { toast } from '@/hooks/use-toast';
import type { User } from '@/contexts/appContext.types';
import { submitSupportTicket } from '@/features/support/hooks/supportTicketMutations';
import { ticketMessagesService } from '@/features/support/services/ticketMessages.service';
import { ticketService, type SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportDraftState } from '@/features/support';
import { MAX_CLIENT_CONSECUTIVE_MESSAGES } from '@/features/support/hooks/useSupportChatDock.business';
import type { SupportChatScope } from '@/features/support/supportChat.events';

export async function submitSupportChatReply({
  canClientSend,
  canReply,
  loadTickets,
  responseText,
  scope,
  selectedTicket,
  user,
}: {
  canClientSend: boolean;
  canReply: boolean;
  loadTickets: () => Promise<void>;
  responseText: string;
  scope: SupportChatScope;
  selectedTicket: SupportAdminTicketRecord | null;
  user: Pick<User, 'id'> | null;
}) {
  if (!selectedTicket || !responseText.trim() || !user?.id) {
    return false;
  }

  const now = new Date().toISOString();
  const trimmedResponse = responseText.trim();

  if (scope === 'admin') {
    if (!canReply) {
      toast({
        title: 'Este ticket ya tiene responsable',
        description: 'Continua desde la bandeja del admin asignado.',
        variant: 'destructive',
      });
      return false;
    }

    await ticketMessagesService.send({
      content: trimmedResponse,
      ticketId: selectedTicket.id,
      user: { id: user.id, role: 'admin' },
    });
    await ticketService.updateTicket(selectedTicket.id, {
      assigned_admin_id: user.id,
      fecha_respuesta: now,
      status: 'in_conversation',
    });
  } else {
    if (!canClientSend) {
      toast({
        title: 'Espera la respuesta del equipo',
        description: `Puedes enviar hasta ${MAX_CLIENT_CONSECUTIVE_MESSAGES} mensajes seguidos por turno.`,
        variant: 'destructive',
      });
      return false;
    }

    await ticketMessagesService.send({
      content: trimmedResponse,
      ticketId: selectedTicket.id,
      user: { id: user.id, role: 'user' },
    });
    await ticketService.updateTicket(selectedTicket.id, {
      fecha_respuesta_cliente: now,
      status: 'in_conversation',
    });
  }

  await loadTickets();
  return true;
}

export async function createSupportChatTicket({
  draft,
  loadTickets,
  scope,
  user,
}: {
  draft: SupportDraftState;
  loadTickets: () => Promise<void>;
  scope: SupportChatScope;
  user: User | null;
}) {
  if (scope !== 'client' || !user) {
    return null;
  }

  if (!draft.title.trim() || !draft.description.trim()) {
    toast({
      title: 'Completa el ticket',
      description: 'Necesitamos un asunto y un mensaje para abrir la conversacion.',
      variant: 'destructive',
    });
    return null;
  }

  const ticket = await submitSupportTicket({ draft, user });
  await loadTickets();
  return ticket;
}
