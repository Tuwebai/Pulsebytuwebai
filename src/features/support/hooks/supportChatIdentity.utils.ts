import type { UserRecord } from '@/features/auth/services/user.service';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportConversationSummary, TicketMessage } from '@/features/support/ticketMessages.types';

function getCounterpartMessage(messages: TicketMessage[], role: 'admin' | 'client') {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.sender_role === role && message.sender) {
      return message.sender;
    }
  }

  return null;
}

export function buildConversationIdentity({
  scope,
  summary,
  ticket,
  userMap,
}: {
  scope: 'admin' | 'client';
  summary: SupportConversationSummary;
  ticket: SupportAdminTicketRecord;
  userMap: Record<string, UserRecord>;
}) {
  const clientProfile = ticket.user_id ? userMap[ticket.user_id] : undefined;
  const adminProfile = ticket.assigned_admin_id ? userMap[ticket.assigned_admin_id] : undefined;
  const fallbackClientSender = getCounterpartMessage(summary.messages, 'client');
  const fallbackAdminSender = getCounterpartMessage(summary.messages, 'admin');
  const participantProfile = scope === 'admin' ? clientProfile : adminProfile;
  const fallbackParticipant = scope === 'admin' ? fallbackClientSender : fallbackAdminSender;
  const participantName =
    participantProfile?.full_name ||
    participantProfile?.email ||
    fallbackParticipant?.full_name ||
    fallbackParticipant?.email ||
    (scope === 'admin' ? 'Cliente' : 'Equipo Pulse');
  const participantEmail = participantProfile?.email || fallbackParticipant?.email || null;
  const participantAvatarUrl = participantProfile?.avatar_url || fallbackParticipant?.avatar_url || null;
  const assignedAdminName =
    adminProfile?.full_name || adminProfile?.email || fallbackAdminSender?.full_name || fallbackAdminSender?.email || null;

  return {
    ...summary,
    assignedAdminName,
    participantAvatarUrl,
    participantEmail,
    participantName,
  };
}
