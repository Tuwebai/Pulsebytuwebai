import { pulseMcpConfig } from '../env.js';
import { supabase } from './client.js';
import { normalizeEmail } from './admin.js';
import { resolveTicketIdentifier } from './support.js';
import { fetchUserById, resolveUserIdentifier } from './users.js';

function requireOperatorUserId(operatorUserId?: string) {
  const resolvedOperatorUserId = operatorUserId?.trim() || pulseMcpConfig.operatorUserId;

  if (!resolvedOperatorUserId) {
    throw new Error('Falta operatorUserId para auditar esta accion en Pulse.');
  }

  return resolvedOperatorUserId;
}

function normalizeTicketPriority(priority?: string) {
  if (!priority) {
    return null;
  }

  const normalized = priority.trim().toLowerCase();
  if (normalized === 'low') return { prioridad: 'baja', priority: 'low' };
  if (normalized === 'high') return { prioridad: 'alta', priority: 'high' };
  if (normalized === 'baja' || normalized === 'media' || normalized === 'alta') {
    return {
      prioridad: normalized,
      priority: normalized === 'baja' ? 'low' : normalized === 'alta' ? 'high' : 'medium',
    };
  }

  if (normalized === 'medium') {
    return { prioridad: 'media', priority: 'medium' };
  }

  throw new Error('La prioridad del ticket debe ser baja, media, alta, low, medium o high.');
}

async function appendTicketMessage(input: {
  ticketId: string;
  senderId: string;
  senderRole: 'admin' | 'client';
  content: string;
}) {
  const content = input.content.trim();

  if (!content) {
    return null;
  }

  const { data, error } = await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: input.ticketId,
      sender_id: input.senderId,
      sender_role: input.senderRole,
      content,
    })
    .select('id, ticket_id, sender_id, sender_role, content, created_at')
    .single();

  if (error) throw error;

  return data;
}

export async function createTicket(input: {
  userIdentifier: string;
  title: string;
  message: string;
  priority?: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const currentUser = await fetchUserById(user.id);
  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) {
    throw new Error('Necesitamos el asunto del ticket para crearlo.');
  }

  if (!message) {
    throw new Error('Necesitamos el mensaje inicial del ticket para crearlo.');
  }

  if (!currentUser.email?.trim()) {
    throw new Error('Necesitamos un email real del cliente para crear el ticket en Pulse.');
  }

  const priority = normalizeTicketPriority(input.priority);
  const { data: createdTicket, error } = await supabase
    .from('tickets')
    .insert({
      asunto: title,
      mensaje: message,
      email: normalizeEmail(currentUser.email),
      user_id: user.id,
      estado: 'abierto',
      status: 'open',
      ...(priority ?? {}),
    })
    .select('id, asunto, estado, prioridad, status, priority, user_id, created_at, updated_at')
    .single();

  if (error) throw error;

  const createdMessage = await appendTicketMessage({
    ticketId: createdTicket.id,
    senderId: user.id,
    senderRole: 'client',
    content: message,
  });

  return {
    resolvedUser: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
    },
    ticket: createdTicket,
    message: createdMessage,
  };
}

export async function replyToTicket(input: {
  ticketIdentifier: string;
  message: string;
  authorRole?: 'admin' | 'client';
  operatorUserId?: string;
}) {
  const ticket = await resolveTicketIdentifier(input.ticketIdentifier);
  const message = input.message.trim();
  const authorRole = input.authorRole ?? 'admin';

  if (!message) {
    throw new Error('Necesitamos el mensaje para responder el ticket.');
  }

  const senderId = authorRole === 'admin'
    ? requireOperatorUserId(input.operatorUserId)
    : ticket.user_id;

  if (!senderId) {
    throw new Error('No pudimos resolver el autor real de la respuesta del ticket.');
  }

  const ticketUpdates = authorRole === 'admin'
    ? {
        estado: 'respondido',
        status: 'in_conversation',
        respuesta: message,
        respondido_por: senderId,
        fecha_respuesta: new Date().toISOString(),
        assigned_admin_id: senderId,
        updated_at: new Date().toISOString(),
      }
    : {
        estado: 'abierto',
        status: 'open',
        respuesta_cliente: message,
        fecha_respuesta_cliente: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  const { data: updatedTicket, error: ticketError } = await supabase
    .from('tickets')
    .update(ticketUpdates)
    .eq('id', ticket.id)
    .select('id, asunto, estado, prioridad, status, priority, user_id, assigned_admin_id, created_at, updated_at')
    .single();

  if (ticketError) throw ticketError;

  const createdMessage = await appendTicketMessage({
    ticketId: ticket.id,
    senderId,
    senderRole: authorRole,
    content: message,
  });

  return {
    ticketBefore: ticket,
    ticketAfter: updatedTicket,
    message: createdMessage,
  };
}

export async function closeTicket(input: {
  ticketIdentifier: string;
  operatorUserId?: string;
  resolutionNote?: string;
}) {
  const ticket = await resolveTicketIdentifier(input.ticketIdentifier);

  if (ticket.estado === 'cerrado') {
    throw new Error('El ticket ya esta cerrado en Pulse.');
  }

  const operatorUserId = requireOperatorUserId(input.operatorUserId);
  const closedAt = new Date().toISOString();
  const resolutionNote = input.resolutionNote?.trim() || null;
  const { data: updatedTicket, error } = await supabase
    .from('tickets')
    .update({
      estado: 'cerrado',
      status: 'closed',
      respuesta: resolutionNote ?? ticket.mensaje ?? ticket.asunto ?? 'Ticket cerrado.',
      respondido_por: operatorUserId,
      fecha_respuesta: closedAt,
      assigned_admin_id: ticket.assigned_admin_id ?? operatorUserId,
      updated_at: closedAt,
    })
    .eq('id', ticket.id)
    .select('id, asunto, mensaje, email, estado, prioridad, status, priority, user_id, assigned_admin_id, created_at, updated_at')
    .single();

  if (error) throw error;

  const message = resolutionNote
    ? await appendTicketMessage({
        ticketId: ticket.id,
        senderId: operatorUserId,
        senderRole: 'admin',
        content: resolutionNote,
      })
    : null;

  return {
    closed_at: closedAt,
    ticketBefore: ticket,
    ticketAfter: updatedTicket,
    message,
  };
}

export async function reopenTicket(input: {
  ticketIdentifier: string;
  operatorUserId?: string;
  reason?: string;
}) {
  const ticket = await resolveTicketIdentifier(input.ticketIdentifier);

  if (ticket.estado !== 'cerrado') {
    throw new Error('Solo podemos reabrir tickets que ya esten cerrados en Pulse.');
  }

  const operatorUserId = requireOperatorUserId(input.operatorUserId);
  const reopenedAt = new Date().toISOString();
  const reason = input.reason?.trim() || null;
  const { data: updatedTicket, error } = await supabase
    .from('tickets')
    .update({
      estado: 'abierto',
      status: 'open',
      updated_at: reopenedAt,
    })
    .eq('id', ticket.id)
    .select('id, asunto, mensaje, email, estado, prioridad, status, priority, user_id, assigned_admin_id, created_at, updated_at')
    .single();

  if (error) throw error;

  const message = reason
    ? await appendTicketMessage({
        ticketId: ticket.id,
        senderId: operatorUserId,
        senderRole: 'admin',
        content: reason,
      })
    : null;

  return {
    reopened_at: reopenedAt,
    ticketBefore: ticket,
    ticketAfter: updatedTicket,
    message,
  };
}

export async function assignTicket(input: {
  ticketIdentifier: string;
  assigneeIdentifier: string;
}) {
  const ticket = await resolveTicketIdentifier(input.ticketIdentifier);
  const assignee = await resolveUserIdentifier(input.assigneeIdentifier);
  const assigneeDetail = await fetchUserById(assignee.id);

  if (assigneeDetail.role !== 'admin') {
    throw new Error('Solo podemos asignar tickets a usuarios admin en Pulse.');
  }

  const assignedAt = new Date().toISOString();
  const { data: updatedTicket, error } = await supabase
    .from('tickets')
    .update({
      assigned_admin_id: assignee.id,
      updated_at: assignedAt,
    })
    .eq('id', ticket.id)
    .select('id, asunto, mensaje, email, estado, prioridad, status, priority, user_id, assigned_admin_id, created_at, updated_at')
    .single();

  if (error) throw error;

  return {
    assigned_at: assignedAt,
    ticketBefore: ticket,
    ticketAfter: updatedTicket,
    assignee: {
      id: assigneeDetail.id,
      email: assigneeDetail.email,
      full_name: assigneeDetail.full_name,
      role: assigneeDetail.role ?? null,
    },
  };
}
