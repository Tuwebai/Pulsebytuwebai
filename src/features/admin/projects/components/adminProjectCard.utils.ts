import type { Project } from '@/types/project.types';

export function getProjectStatusLabel(status: Project['status']) {
  switch (status) {
    case 'production':
      return 'En producción';
    case 'paused':
      return 'Pausado';
    case 'maintenance':
      return 'Mantenimiento';
    case 'development':
    default:
      return 'En seguimiento';
  }
}

export function getProjectStatusClasses(status: Project['status']) {
  switch (status) {
    case 'production':
      return 'border-[var(--success)]/20 bg-[var(--success-dim)] text-[var(--success)]';
    case 'paused':
      return 'border-[var(--warning)]/20 bg-[var(--warning-dim)] text-[var(--warning)]';
    case 'maintenance':
      return 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]';
    case 'development':
    default:
      return 'border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]';
  }
}

export function getApprovalLabel(status?: Project['approval_status']) {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Observado';
    case 'pending':
      return 'Pendiente de aprobación';
    default:
      return null;
  }
}

export function getApprovalClasses(status?: Project['approval_status']) {
  switch (status) {
    case 'approved':
      return 'border-[var(--success)]/20 bg-[var(--success-dim)] text-[var(--success)]';
    case 'rejected':
      return 'border-danger/20 bg-danger/12 text-danger';
    case 'pending':
      return 'border-[var(--warning)]/20 bg-[var(--warning-dim)] text-[var(--warning)]';
    default:
      return '';
  }
}

export function getProjectProgress(project: Project) {
  return project.progress ?? project.completion_percentage ?? 0;
}

export function formatOperationalDate(value?: string) {
  if (!value) return 'Sin registro';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
