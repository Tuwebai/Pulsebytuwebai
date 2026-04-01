import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';

type TicketInput = Partial<Omit<SupportAdminTicketRecord, 'id'>>;
type TicketRow = Record<string, unknown>;

export function normalizeTicketStatus(status?: string | null) {
  switch (status) {
    case 'abierto':
      return 'open';
    case 'respondido':
    case 'en_progreso':
      return 'in_conversation';
    case 'resuelto':
      return 'resolved';
    case 'cerrado':
      return 'closed';
    default:
      return status || 'open';
  }
}

export function normalizeTicketPriority(priority?: string | null) {
  switch (priority) {
    case 'baja':
      return 'low';
    case 'alta':
      return 'high';
    case 'urgente':
      return 'urgent';
    default:
      return priority || 'medium';
  }
}

function toDbStatus(status?: string | null) {
  switch (status) {
    case 'resolved':
      return 'resuelto';
    case 'in_progress':
    case 'in_conversation':
      return 'respondido';
    case 'closed':
      return 'cerrado';
    default:
      return 'abierto';
  }
}

function toDbPriority(priority?: string | null) {
  switch (priority) {
    case 'low':
      return 'baja';
    case 'high':
      return 'alta';
    case 'urgent':
      return 'urgente';
    default:
      return 'media';
  }
}

export function mapTicketRow(row: TicketRow): SupportAdminTicketRecord {
  const asunto = (row.asunto as string | undefined) || (row.title as string | undefined) || 'Sin asunto';
  const mensaje = (row.mensaje as string | undefined) || (row.description as string | undefined) || '';

  return {
    ...(row as Record<string, unknown>),
    id: String(row.id ?? ''),
    asunto,
    mensaje,
    title: asunto,
    description: mensaje,
    status: normalizeTicketStatus((row.status as string | undefined) || (row.estado as string | undefined)),
    priority: normalizeTicketPriority((row.priority as string | undefined) || (row.prioridad as string | undefined)),
  };
}

export function buildTicketInsertPayload(ticket: TicketInput) {
  const now = ticket.created_at || new Date().toISOString();
  const title = ticket.title || ticket.asunto || 'Sin asunto';
  const description = ticket.description || ticket.mensaje || '';
  const status = normalizeTicketStatus(ticket.status || ticket.estado);
  const priority = normalizeTicketPriority(ticket.priority || ticket.prioridad);

  return {
    asunto: title,
    mensaje: description,
    email: ticket.email || null,
    fecha: ticket.fecha || now,
    estado: toDbStatus(status),
    prioridad: toDbPriority(priority),
    status,
    priority,
    user_id: ticket.user_id || null,
    assigned_to: ticket.assigned_to || null,
    project_id: ticket.project_id || null,
    category: ticket.category || null,
    created_at: now,
    updated_at: ticket.updated_at || now,
    respuesta: ticket.respuesta || null,
    respondido_por: ticket.respondido_por || null,
    fecha_respuesta: ticket.fecha_respuesta || null,
    respuesta_cliente: ticket.respuesta_cliente || null,
    fecha_respuesta_cliente: ticket.fecha_respuesta_cliente || null,
  };
}

export function buildTicketUpdatePayload(updates: TicketInput) {
  const payload: Record<string, unknown> = {
    updated_at: updates.updated_at || new Date().toISOString(),
  };

  if ('title' in updates || 'asunto' in updates) payload.asunto = updates.title || updates.asunto || 'Sin asunto';
  if ('description' in updates || 'mensaje' in updates) payload.mensaje = updates.description || updates.mensaje || '';
  if ('status' in updates || 'estado' in updates) {
    const status = normalizeTicketStatus(updates.status || updates.estado);
    payload.status = status;
    payload.estado = toDbStatus(status);
  }
  if ('priority' in updates || 'prioridad' in updates) {
    const priority = normalizeTicketPriority(updates.priority || updates.prioridad);
    payload.priority = priority;
    payload.prioridad = toDbPriority(priority);
  }
  if ('respuesta' in updates) payload.respuesta = updates.respuesta || null;
  if ('respondido_por' in updates) payload.respondido_por = updates.respondido_por || null;
  if ('fecha_respuesta' in updates) payload.fecha_respuesta = updates.fecha_respuesta || null;
  if ('respuesta_cliente' in updates) payload.respuesta_cliente = updates.respuesta_cliente || null;
  if ('fecha_respuesta_cliente' in updates) payload.fecha_respuesta_cliente = updates.fecha_respuesta_cliente || null;
  if ('assigned_to' in updates) payload.assigned_to = updates.assigned_to || null;
  if ('category' in updates) payload.category = updates.category || null;
  if ('email' in updates) payload.email = updates.email || null;
  if ('fecha' in updates) payload.fecha = updates.fecha || null;
  if ('project_id' in updates) payload.project_id = updates.project_id || null;

  return payload;
}
