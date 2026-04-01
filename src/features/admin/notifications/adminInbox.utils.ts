import type { NavigateFunction } from 'react-router-dom';

import type { InboxSegmentId } from '@/features/admin/notifications/components/AdminInboxFilters';
import type {
  EventFilters,
  OperationalEvent,
} from '@/features/admin/notifications/services/adminNotifications.service';

export type CounterFilterId =
  | 'all'
  | 'critical'
  | 'unassigned'
  | 'in_progress'
  | 'resolved_today';

export const EMPTY_COUNTS = {
  open_total: 0,
  critical_open: 0,
  unassigned: 0,
  in_progress: 0,
  resolved_today: 0,
};

export function buildInboxFilters(
  counter: CounterFilterId,
  segment: InboxSegmentId,
  search: string,
): EventFilters {
  const filters: EventFilters = {
    status: counter === 'resolved_today' ? ['resolved'] : ['open', 'in_progress'],
    search,
  };

  if (counter === 'critical' || segment === 'critical') filters.severity = ['critical'];
  if (counter === 'unassigned' || segment === 'unassigned') filters.owner_id = 'unassigned';
  if (counter === 'in_progress') filters.status = ['in_progress'];
  if (segment === 'payments') filters.source_type = ['payment'];
  if (segment === 'support') filters.source_type = ['ticket'];
  if (segment === 'domain') filters.source_type = ['domain'];
  if (segment === 'approvals') filters.source_type = ['project'];

  return filters;
}

export function getInboxPrimaryActionLabel(event: OperationalEvent) {
  switch (event.source_type) {
    case 'payment':
      return 'Abrir pago';
    case 'ticket':
      return 'Abrir ticket';
    case 'project':
      return 'Abrir proyecto';
    case 'onboarding':
      return 'Ver cliente';
    case 'domain':
      return 'Configurar GA4';
    default:
      return 'Abrir operación';
  }
}

export function openInboxPrimaryAction(
  navigate: NavigateFunction,
  event: OperationalEvent,
) {
  switch (event.source_type) {
    case 'payment':
      navigate('/admin/pagos');
      return;
    case 'ticket':
      navigate('/admin/tickets');
      return;
    case 'project':
    case 'domain':
      navigate('/admin/proyectos');
      return;
    case 'onboarding':
      navigate(`/perfil/${event.client_id}`);
      return;
    default:
      navigate('/admin');
  }
}
