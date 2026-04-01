import {
  assignEvent,
  fetchEventCounts,
  fetchEvents,
  fetchOperationalEventAdmins,
  resolveEvent,
  snoozeEvent,
  type EventCounts,
  type EventFilters,
  type EventType,
  type OperationalEvent,
  type OperationalEventAdminRecord,
  type OperationalEventSeverity,
  updateEventStatus,
} from '@/api/admin/operationalEvents.api';

export type { EventCounts, EventFilters, EventType, OperationalEvent, OperationalEventSeverity };

export interface InboxAdminAssignee {
  id: string;
  name: string;
  email: string;
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  payment_pending: 'Pago pendiente',
  payment_rejected: 'Pago rechazado',
  payment_overdue: 'Pago vencido',
  ticket_critical: 'Ticket crítico',
  ticket_sla_breach: 'Incumplimiento de SLA',
  domain_not_connected: 'Dominio sin conectar',
  ga4_not_connected: 'GA4 sin conectar',
  client_no_pulse_data: 'Cliente sin datos en Pulse',
  project_approval_pending: 'Aprobación de proyecto pendiente',
  onboarding_incomplete: 'Onboarding incompleto',
  metrics_drop: 'Caída de métricas',
  system_alert: 'Alerta del sistema',
};

const SEVERITY_LABELS: Record<OperationalEventSeverity, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

const SEVERITY_COLORS: Record<OperationalEventSeverity, string> = {
  critical: 'var(--danger)',
  high: 'var(--warning)',
  medium: 'var(--signal)',
  low: 'var(--text-secondary)',
};

function isExpiredSnooze(event: OperationalEvent) {
  if (event.status !== 'snoozed' || !event.snoozed_until) {
    return false;
  }

  return new Date(event.snoozed_until).getTime() < Date.now();
}

export async function getInboxEvents(filters: EventFilters = {}): Promise<OperationalEvent[]> {
  const events = await fetchEvents(filters);
  const expiredSnoozedEvents = events.filter(isExpiredSnooze);

  if (expiredSnoozedEvents.length === 0) {
    return events;
  }

  await Promise.all(expiredSnoozedEvents.map((event) => updateEventStatus(event.id, 'open')));
  return fetchEvents(filters);
}

export async function getInboxCounts(): Promise<EventCounts> {
  return fetchEventCounts();
}

export async function getInboxAdmins(): Promise<InboxAdminAssignee[]> {
  const admins = await fetchOperationalEventAdmins();

  return admins.map((admin: OperationalEventAdminRecord) => ({
    id: admin.id,
    name: admin.full_name ?? admin.email ?? 'Admin sin nombre',
    email: admin.email ?? '',
  }));
}

export async function assignInboxEvent(id: string, ownerId: string | null): Promise<void> {
  return assignEvent(id, ownerId);
}

export async function snoozeInboxEvent(id: string, until: Date): Promise<void> {
  return snoozeEvent(id, until);
}

export async function resolveInboxEvent(id: string): Promise<void> {
  return resolveEvent(id);
}

export async function markInboxEventInProgress(id: string): Promise<void> {
  return updateEventStatus(id, 'in_progress');
}

export function getSeverityLabel(severity: OperationalEventSeverity): string {
  return SEVERITY_LABELS[severity];
}

export function getEventTypeLabel(type: EventType): string {
  return EVENT_TYPE_LABELS[type];
}

export function getImpactColor(severity: OperationalEventSeverity): string {
  return SEVERITY_COLORS[severity];
}

export function canResolve(event: OperationalEvent, currentUserId: string): boolean {
  return !event.owner_id || event.owner_id === currentUserId;
}

export function formatEventAge(createdAt: string): string {
  const deltaMs = Date.now() - new Date(createdAt).getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (deltaMs < hourMs) {
    const minutes = Math.max(1, Math.floor(deltaMs / minuteMs));
    return `Hace ${minutes} min`;
  }

  if (deltaMs < dayMs) {
    const hours = Math.max(1, Math.floor(deltaMs / hourMs));
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }

  if (deltaMs < dayMs * 2) {
    return 'Ayer';
  }

  const days = Math.max(2, Math.floor(deltaMs / dayMs));
  return `Hace ${days} días`;
}
