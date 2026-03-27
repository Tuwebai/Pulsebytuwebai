import type { ManagedEventInput, ManagedEventRecord, PaymentRow, TicketRow } from './shared.ts';
import { buildEventKey, getPersistedStatus, normalizePriority, normalizeStatus } from './shared.ts';

export function createTicketEvents(tickets: TicketRow[], existingByKey: Map<string, ManagedEventRecord>): ManagedEventInput[] {
  const now = Date.now();
  return tickets.flatMap((ticket) => {
    if (!ticket.user_id) return [];
    const events: ManagedEventInput[] = [];
    const normalizedStatus = normalizeStatus(ticket.status);
    const normalizedPriority = normalizePriority(ticket.priority);
    const ageHours = (now - new Date(ticket.created_at).getTime()) / 36e5;

    if (['open', 'new', 'in_progress'].includes(normalizedStatus) && ['high', 'critical', 'urgent', 'alta'].includes(normalizedPriority)) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: ticket.user_id, type: 'ticket_critical', source_type: 'ticket', source_id: ticket.id }));
      events.push({
        client_id: ticket.user_id,
        type: 'ticket_critical',
        severity: 'critical',
        status: getPersistedStatus(existingEvent),
        title: 'Ticket crítico abierto',
        description: `El ticket ${ticket.asunto ?? 'sin asunto'} requiere atención prioritaria.`,
        impact: 'Riesgo inmediato de fricción en soporte Pulse.',
        suggested_action: 'Asignar owner y responder al cliente en la ventana operativa actual.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'ticket',
        source_id: ticket.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    if (['open', 'new', 'in_progress'].includes(normalizedStatus) && ageHours >= 48) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: ticket.user_id, type: 'ticket_sla_breach', source_type: 'ticket', source_id: ticket.id }));
      events.push({
        client_id: ticket.user_id,
        type: 'ticket_sla_breach',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Ticket fuera de SLA',
        description: `El ticket ${ticket.asunto ?? 'sin asunto'} supera la ventana operativa esperada.`,
        impact: 'Pulse pierde capacidad de respuesta frente al cliente.',
        suggested_action: 'Priorizar resolución o respuesta inmediata del ticket.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'ticket',
        source_id: ticket.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    return events;
  });
}

export function createPaymentEvents(payments: PaymentRow[], existingByKey: Map<string, ManagedEventRecord>): ManagedEventInput[] {
  const now = Date.now();
  return payments.flatMap((payment) => {
    if (!payment.user_id) return [];
    const events: ManagedEventInput[] = [];
    const normalizedStatus = normalizeStatus(payment.status || payment.mercadopago_status);
    const ageHours = (now - new Date(payment.created_at).getTime()) / 36e5;

    if (['rejected', 'failed', 'cancelled'].includes(normalizedStatus)) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: payment.user_id, type: 'payment_rejected', source_type: 'payment', source_id: payment.id }));
      events.push({
        client_id: payment.user_id,
        type: 'payment_rejected',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Pago rechazado',
        description: payment.description ?? 'Existe un pago rechazado para este cliente.',
        impact: 'Riesgo de interrupción operativa o comercial en Pulse.',
        suggested_action: 'Contactar al cliente y revisar el estado del cobro.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'payment',
        source_id: payment.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    } else if (normalizedStatus === 'pending' && ageHours >= 48) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: payment.user_id, type: 'payment_overdue', source_type: 'payment', source_id: payment.id }));
      events.push({
        client_id: payment.user_id,
        type: 'payment_overdue',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Pago vencido',
        description: payment.description ?? 'Existe un pago pendiente fuera de plazo operativo.',
        impact: 'Riesgo de bloqueo comercial o seguimiento manual adicional.',
        suggested_action: 'Revisar el cobro y activar seguimiento con el cliente.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'payment',
        source_id: payment.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    } else if (normalizedStatus === 'pending') {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: payment.user_id, type: 'payment_pending', source_type: 'payment', source_id: payment.id }));
      events.push({
        client_id: payment.user_id,
        type: 'payment_pending',
        severity: 'medium',
        status: getPersistedStatus(existingEvent),
        title: 'Pago pendiente',
        description: payment.description ?? 'Existe un pago pendiente de confirmación.',
        impact: 'Seguimiento financiero pendiente dentro de Pulse.',
        suggested_action: 'Monitorear la acreditación y confirmar el estado con el cliente.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'payment',
        source_id: payment.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    return events;
  });
}
