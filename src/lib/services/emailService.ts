import { SUPPORT_CONTACT } from '@/config/supportContact';
import { EMAIL_CONFIG, sendEmailWithEmailJS } from '../config/emailConfig';

// Servicio de email para tickets de soporte
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// FunciÃ³n para enviar email usando un solo template con variables
export const sendEmailWithTemplate = async (emailType: string, data: any) => {
  try {
    let subject = '';
    
    // Determinar el asunto segÃºn el tipo de email
    switch (emailType) {
      case 'support_ticket':
        subject = `[SOPORTE] Nuevo Ticket - ${data.ticket_subject}`;
        break;
        
      case 'ticket_confirmation':
        subject = `[Pulse by TuWebAI] Ticket de Soporte Recibido - ${data.ticket_subject}`;
        break;
        
      case 'ticket_response':
        subject = `[Pulse by TuWebAI] Respuesta a tu ticket - ${data.ticket_subject}`;
        break;
        
      case 'daily_summary':
        subject = `[Pulse by TuWebAI] Resumen Diario de Soporte - ${data.date}`;
        break;
        
      case 'user_invitation':
        subject = `[Pulse by TuWebAI] Invitacion para unirte al equipo - ${data.role}`;
        break;
        
      default:
        throw new Error('Tipo de email no vÃ¡lido');
    }

    // Preparar parÃ¡metros para EmailJS (solo variables bÃ¡sicas)
    const templateParams = {
      // Variables bÃ¡sicas de EmailJS
      to_email: data.to_email || EMAIL_CONFIG.EMAILS.SUPPORT,
      from_name: data.from_name || 'Pulse by TuWebAI',
      from_email: data.from_email || EMAIL_CONFIG.EMAILS.FROM_EMAIL,
      reply_to: data.reply_to || data.client_email || EMAIL_CONFIG.EMAILS.SUPPORT,
      
      // Variables del ticket
      ticket_subject: data.ticket_subject || 'Sin asunto',
      ticket_message: data.ticket_message || 'Sin mensaje',
      client_email: data.client_email || 'cliente@ejemplo.com',
      ticket_priority: data.ticket_priority || 'MEDIA',
      ticket_date: data.ticket_date || new Date().toLocaleString('es-ES'),
      ticket_id: data.ticket_id || 'TICKET-001',
      support_email: SUPPORT_CONTACT.publicEmail,
      
      // Variables para respuestas
      admin_response: data.admin_response || '',
      admin_name: data.admin_name || 'Equipo de Soporte',
      response_date: data.response_date || '',
      
      // Variables para resumen
      total_tickets: data.total_tickets || 0,
      new_tickets: data.new_tickets || 0,
      resolved_tickets: data.resolved_tickets || 0,
      pending_tickets: data.pending_tickets || 0,
      date: data.date || new Date().toLocaleDateString('es-ES'),
      
      // Tipo de email para el template
      email_type: emailType
    };



    // Enviar email usando EmailJS
    const result = await sendEmailWithEmailJS(
      EMAIL_CONFIG.TEMPLATES.MAIN_TEMPLATE,
      templateParams
    );

    if (result.success) {

      return { success: true, message: 'Email enviado correctamente' };
    } else {
      console.error(`Error enviando email ${emailType}:`, result.error);
      return { success: false, message: 'Error enviando email' };
    }
    
  } catch (error) {
    console.error(`Error enviando email ${emailType}:`, error);
    return { success: false, message: 'Error enviando email' };
  }
};

// FunciÃ³n para enviar email de ticket de soporte
export const sendSupportTicketEmail = async (ticketData: {
  asunto: string;
  mensaje: string;
  email: string; // Email del cliente
  prioridad: 'baja' | 'media' | 'alta';
  fecha: string;
}) => {
  const data = {
    to_email: EMAIL_CONFIG.EMAILS.SUPPORT, // inbox interno de soporte
    from_name: 'Cliente Pulse by TuWebAI',
    from_email: ticketData.email, // Email del cliente que ENVÃA
    reply_to: ticketData.email, // Para responder directamente al cliente
    ticket_subject: ticketData.asunto,
    ticket_message: ticketData.mensaje,
    client_email: ticketData.email,
    ticket_priority: ticketData.prioridad.toUpperCase(),
    ticket_date: new Date(ticketData.fecha).toLocaleString('es-ES')
  };

  return await sendEmailWithTemplate('support_ticket', data);
};

// FunciÃ³n para enviar confirmaciÃ³n al cliente
export const sendTicketConfirmationEmail = async (ticketData: {
  asunto: string;
  mensaje: string;
  email: string;
  prioridad: 'baja' | 'media' | 'alta';
  fecha: string;
  ticketId: string;
}) => {
  const data = {
    to_email: ticketData.email, // El cliente RECIBE
    from_name: 'Pulse by TuWebAI',
    from_email: EMAIL_CONFIG.EMAILS.FROM_EMAIL, // Tu email de EmailJS ENVÃA
    reply_to: EMAIL_CONFIG.EMAILS.SUPPORT, // Para que el cliente responda al soporte
    ticket_id: ticketData.ticketId,
    ticket_subject: ticketData.asunto,
    ticket_message: ticketData.mensaje,
    ticket_priority: ticketData.prioridad.toUpperCase(),
    ticket_date: new Date(ticketData.fecha).toLocaleString('es-ES'),
    client_email: ticketData.email
  };

  return await sendEmailWithTemplate('ticket_confirmation', data);
};

// FunciÃ³n para enviar notificaciÃ³n de respuesta del admin
export const sendTicketResponseEmail = async (ticketData: {
  asunto: string;
  email: string;
  respuesta: string;
  respondidoPor: string;
  fechaRespuesta: string;
  ticketId: string;
}) => {
  const data = {
    to_email: ticketData.email, // El cliente RECIBE
    from_name: 'Pulse by TuWebAI',
    from_email: EMAIL_CONFIG.EMAILS.FROM_EMAIL, // Tu email de EmailJS ENVÃA
    reply_to: EMAIL_CONFIG.EMAILS.SUPPORT, // Para que el cliente responda al soporte
    ticket_id: ticketData.ticketId,
    ticket_subject: ticketData.asunto,
    admin_response: ticketData.respuesta,
    admin_name: ticketData.respondidoPor,
    response_date: new Date(ticketData.fechaRespuesta).toLocaleString('es-ES'),
    client_email: ticketData.email
  };

  return await sendEmailWithTemplate('ticket_response', data);
};

// FunciÃ³n para enviar resumen diario al admin
export const sendDailySummaryEmail = async (summaryData: {
  total_tickets: number;
  new_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
  date: string;
  tickets_list: Array<{
    id: string;
    subject: string;
    client_email: string;
    priority: string;
    status: string;
  }>;
}) => {
  const data = {
    to_email: EMAIL_CONFIG.EMAILS.SUPPORT, // inbox interno de soporte
    from_name: 'Pulse by TuWebAI',
    from_email: EMAIL_CONFIG.EMAILS.FROM_EMAIL, // Tu email de EmailJS ENVÃA
    reply_to: EMAIL_CONFIG.EMAILS.SUPPORT,
    ...summaryData
  };

  return await sendEmailWithTemplate('daily_summary', data);
}; 

