import type { BadgeProps } from '@/core/components/Badge';

export function getProjectStatusVariant(status?: string | null): BadgeProps['variant'] {
  if (!status) {
    return 'default';
  }

  if (status === 'production' || status === 'completed') {
    return 'success';
  }

  if (status === 'development' || status === 'in_progress') {
    return 'signal';
  }

  return 'default';
}

export function getProjectStatusLabel(status?: string | null): string {
  if (!status) {
    return 'Mantenimiento';
  }

  if (status === 'production' || status === 'completed') {
    return 'Entregado';
  }

  if (status === 'development' || status === 'in_progress') {
    return 'En desarrollo';
  }

  return 'Mantenimiento';
}

export function getPaymentBadgeVariant(status?: string | null): BadgeProps['variant'] {
  if (!status) {
    return 'default';
  }

  if (status === 'approved' || status === 'paid' || status === 'completed') {
    return 'success';
  }

  if (status === 'pending' || status === 'in_process') {
    return 'signal';
  }

  return 'default';
}

export function getPaymentBadgeLabel(status?: string | null): string {
  if (!status) {
    return 'Sin pagos';
  }

  if (status === 'approved' || status === 'paid' || status === 'completed') {
    return 'Aprobado';
  }

  if (status === 'pending' || status === 'in_process') {
    return 'Pendiente';
  }

  return 'Registrado';
}
