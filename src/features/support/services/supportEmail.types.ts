export type SupportEmailPriority = 'baja' | 'media' | 'alta';

export interface SupportTicketEmailInput {
  asunto: string;
  mensaje: string;
  email: string;
  prioridad: SupportEmailPriority;
  fecha: string;
}

export interface SupportTicketConfirmationEmailInput extends SupportTicketEmailInput {
  ticketId: string;
}

export interface SupportEmailTemplateParams {
  to_email: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  ticket_subject: string;
  ticket_message: string;
  client_email: string;
  ticket_priority: string;
  ticket_date: string;
  ticket_id?: string;
  support_email: string;
  email_type: 'support_ticket' | 'ticket_confirmation';
}

export interface SupportEmailResult {
  success: boolean;
  message: string;
}
