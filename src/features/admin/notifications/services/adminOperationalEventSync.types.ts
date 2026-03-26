import type { EventType } from '@/api/admin/operationalEvents.api';

export const MANAGED_EVENT_TYPES: EventType[] = [
  'payment_pending',
  'payment_rejected',
  'payment_overdue',
  'ticket_critical',
  'ticket_sla_breach',
  'domain_not_connected',
  'ga4_not_connected',
  'client_no_pulse_data',
  'project_approval_pending',
  'onboarding_incomplete',
];
