import type { BadgeProps } from '@/core/components/Badge';

export function getPriorityLabel(priority: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return 'Sin prioridad';
  }
}

export function getPriorityVariant(priority: 'low' | 'medium' | 'high'): BadgeProps['variant'] {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: 'open' | 'responded' | 'closed' | 'in_conversation') {
  switch (status) {
    case 'open':
      return 'Abierto';
    case 'responded':
      return 'En progreso';
    case 'in_conversation':
      return 'En progreso';
    case 'closed':
      return 'Cerrado';
    default:
      return 'Desconocido';
  }
}

export function getStatusVariant(status: 'open' | 'responded' | 'closed' | 'in_conversation'): BadgeProps['variant'] {
  switch (status) {
    case 'open':
      return 'signal';
    case 'responded':
      return 'warning';
    case 'in_conversation':
      return 'warning';
    case 'closed':
      return 'success';
    default:
      return 'default';
  }
}
