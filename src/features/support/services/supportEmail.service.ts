import { SUPPORT_CONTACT } from '@/config/supportContact';
import { EMAIL_CONFIG, sendEmailWithEmailJS } from '@/lib/config/emailConfig';
import type {
  SupportEmailResult,
  SupportEmailTemplateParams,
  SupportTicketConfirmationEmailInput,
  SupportTicketEmailInput,
} from '@/features/support/services/supportEmail.types';

function formatSupportDate(date: string) {
  return new Date(date).toLocaleString('es-ES');
}

function buildSupportTicketParams(ticketData: SupportTicketEmailInput): SupportEmailTemplateParams {
  return {
    to_email: EMAIL_CONFIG.EMAILS.SUPPORT,
    from_name: 'Cliente Pulse by TuWebAI',
    from_email: ticketData.email,
    reply_to: ticketData.email,
    ticket_subject: ticketData.asunto,
    ticket_message: ticketData.mensaje,
    client_email: ticketData.email,
    ticket_priority: ticketData.prioridad.toUpperCase(),
    ticket_date: formatSupportDate(ticketData.fecha),
    support_email: SUPPORT_CONTACT.publicEmail,
    email_type: 'support_ticket',
  };
}

function buildTicketConfirmationParams(
  ticketData: SupportTicketConfirmationEmailInput,
): SupportEmailTemplateParams {
  return {
    to_email: ticketData.email,
    from_name: 'Pulse by TuWebAI',
    from_email: EMAIL_CONFIG.EMAILS.FROM_EMAIL,
    reply_to: EMAIL_CONFIG.EMAILS.SUPPORT,
    ticket_id: ticketData.ticketId,
    ticket_subject: ticketData.asunto,
    ticket_message: ticketData.mensaje,
    client_email: ticketData.email,
    ticket_priority: ticketData.prioridad.toUpperCase(),
    ticket_date: formatSupportDate(ticketData.fecha),
    support_email: SUPPORT_CONTACT.publicEmail,
    email_type: 'ticket_confirmation',
  };
}

async function sendSupportEmail(params: SupportEmailTemplateParams): Promise<SupportEmailResult> {
  const result = await sendEmailWithEmailJS(EMAIL_CONFIG.TEMPLATES.MAIN_TEMPLATE, params);

  if (result.success) {
    return { success: true, message: 'Email enviado correctamente' };
  }

  return { success: false, message: 'Error enviando email' };
}

export async function sendSupportTicketEmail(ticketData: SupportTicketEmailInput): Promise<SupportEmailResult> {
  return sendSupportEmail(buildSupportTicketParams(ticketData));
}

export async function sendTicketConfirmationEmail(
  ticketData: SupportTicketConfirmationEmailInput,
): Promise<SupportEmailResult> {
  return sendSupportEmail(buildTicketConfirmationParams(ticketData));
}
