import type { BadgeProps } from '@/core/components/Badge';
import { buildWhatsAppUrl } from '@/config/supportContact';

import type { ProjectDetailPhase, ProjectDetailProject, ProjectDetailTask } from './projectDetail.types';

const ACTIVE_PHASE_STATES = new Set(['en progreso', 'en revisión', 'en revision', 'bloqueada', 'pendiente']);
const COMPLETED_PHASE_STATES = new Set(['terminado', 'aprobada']);
const CLIENT_HINTS = ['cliente', 'client', 'usuario', 'owner'];
const TEAM_HINTS = ['tuwebai', 'tuweb ai', 'equipo', 'admin', 'desarrollo'];

export function getProjectProgress(project: ProjectDetailProject): number {
  if (typeof project.completion_percentage === 'number') {
    return project.completion_percentage;
  }

  if (typeof project.progress === 'number') {
    return project.progress;
  }

  const phases = project.fases ?? [];
  if (phases.length === 0) {
    return 0;
  }

  const completedPhases = phases.filter((phase) =>
    COMPLETED_PHASE_STATES.has((phase.estado ?? '').toLowerCase()),
  ).length;

  return Math.round((completedPhases / phases.length) * 100);
}

export function getProjectStateLabel(project: ProjectDetailProject): string {
  switch (project.status) {
    case 'development':
      return 'En desarrollo';
    case 'production':
      return 'Entregado';
    case 'maintenance':
      return 'En seguimiento';
    case 'paused':
      return 'Pausado';
    default:
      return 'En desarrollo';
  }
}

export function getProjectStateVariant(project: ProjectDetailProject): BadgeProps['variant'] {
  switch (project.status) {
    case 'development':
      return 'signal';
    case 'production':
      return 'success';
    case 'paused':
      return 'warning';
    case 'maintenance':
    default:
      return 'default';
  }
}

export function getCurrentPhase(project: ProjectDetailProject): ProjectDetailPhase | null {
  const phases = project.fases ?? [];

  const activePhase = phases.find((phase) =>
    ACTIVE_PHASE_STATES.has((phase.estado ?? '').toLowerCase()),
  );

  if (activePhase) {
    return activePhase;
  }

  const firstIncompletePhase = phases.find(
    (phase) => !COMPLETED_PHASE_STATES.has((phase.estado ?? '').toLowerCase()),
  );

  return firstIncompletePhase ?? phases[0] ?? null;
}

export function getPhaseDisplayName(phase: ProjectDetailPhase | null): string | null {
  if (!phase) {
    return null;
  }

  const description = phase.descripcion?.trim();
  if (description) {
    return description;
  }

  const key = phase.key?.replace(/^fase_/, '').trim();
  return key ? `Fase ${key}` : 'Etapa actual';
}

function getTaskTitle(task: ProjectDetailTask): string {
  return task.title?.trim() || task.titulo?.trim() || 'Tarea pendiente';
}

export function getAllProjectTasks(project: ProjectDetailProject): ProjectDetailTask[] {
  const phaseTasks = (project.fases ?? []).flatMap((phase) => phase.tareas ?? []);
  return [...(project.tareas ?? []), ...phaseTasks];
}

function taskLooksAssignedToClient(task: ProjectDetailTask): boolean {
  if (task.forClient === true || task.cliente === true) {
    return true;
  }

  const role = (task.assigned_role ?? task.assignedRole ?? '').toLowerCase();
  if (CLIENT_HINTS.some((hint) => role.includes(hint))) {
    return true;
  }

  const assignee = (task.responsable ?? task.assigned_to ?? task.assignedTo ?? '').toLowerCase();
  if (!assignee) {
    return false;
  }

  if (TEAM_HINTS.some((hint) => assignee.includes(hint))) {
    return false;
  }

  return CLIENT_HINTS.some((hint) => assignee.includes(hint));
}

export function getClientPendingTasks(project: ProjectDetailProject): ProjectDetailTask[] {
  return getAllProjectTasks(project).filter((task) => {
    const status = (task.status ?? '').toLowerCase();
    const isDone = status === 'completed' || status === 'done' || status === 'terminado';

    return !isDone && taskLooksAssignedToClient(task);
  });
}

export function getTaskDisplayTitle(task: ProjectDetailTask): string {
  return getTaskTitle(task);
}

export function getTaskMeta(task: ProjectDetailTask): string | null {
  const dueDate = task.fechaLimite?.trim() || task.dueDate?.trim();
  const priority = task.prioridad?.trim() || task.priority?.trim();

  if (dueDate && priority) {
    return `${priority} · ${dueDate}`;
  }

  return dueDate || priority || null;
}

export function getRelativeDateLabel(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absDiffMs < hour) {
    return rtf.format(Math.round(diffMs / minute), 'minute');
  }

  if (absDiffMs < day) {
    return rtf.format(Math.round(diffMs / hour), 'hour');
  }

  return rtf.format(Math.round(diffMs / day), 'day');
}

export function buildWhatsAppContactUrl(message: string): string {
  return buildWhatsAppUrl(message);
}
