import type { TicketMessage } from '@/features/support/ticketMessages.types';

export const MAX_CLIENT_CONSECUTIVE_MESSAGES = 5;

export function getClientConsecutiveMessages(messages: TicketMessage[]) {
  let count = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.sender_role === 'admin') {
      break;
    }

    if (message.sender_role === 'client') {
      count += 1;
    }
  }

  return count;
}

export function canClientSendMessage(messages: TicketMessage[]) {
  return getClientConsecutiveMessages(messages) < MAX_CLIENT_CONSECUTIVE_MESSAGES;
}
