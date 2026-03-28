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
      return 'border-emerald-400/20 bg-emerald-500/12 text-emerald-300';
    case 'paused':
      return 'border-amber-400/20 bg-amber-500/12 text-amber-300';
    case 'maintenance':
      return 'border-violet-400/20 bg-violet-500/12 text-violet-300';
    case 'development':
    default:
      return 'border-signal/20 bg-signal/12 text-signal';
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
      return 'border-emerald-400/20 bg-emerald-500/12 text-emerald-300';
    case 'rejected':
      return 'border-danger/20 bg-danger/12 text-danger';
    case 'pending':
      return 'border-amber-400/20 bg-amber-500/12 text-amber-300';
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
