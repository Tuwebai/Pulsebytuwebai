import type { BadgeProps } from '@/core/components/Badge';
import type { ProjectsPagePhase, ProjectsPageProject } from './projectPage.types';

const COMPLETED_TASK_STATUSES = new Set(['completed', 'done', 'terminado', 'aprobada']);

export function getProjectPhases(project: ProjectsPageProject): ProjectsPagePhase[] {
  return project.fases ?? [];
}

export function getProjectProgress(project: ProjectsPageProject): number {
  if (typeof project.progress === 'number') {
    return project.progress;
  }

  const phases = getProjectPhases(project);

  if (phases.length === 0) {
    return 0;
  }

  const completedPhases = phases.filter((phase) => phase.estado === 'Terminado').length;
  return Math.round((completedPhases / phases.length) * 100);
}

export function getProjectTaskStats(project: ProjectsPageProject) {
  const phases = getProjectPhases(project);
  let total = 0;
  let completed = 0;

  phases.forEach((phase) => {
    const tasks = phase.tasks ?? [];
    total += tasks.length;
    completed += tasks.filter((task) => COMPLETED_TASK_STATUSES.has(task.status?.toLowerCase() ?? '')).length;
  });

  return { completed, total };
}

export function getProjectStateLabel(project: ProjectsPageProject): string {
  switch (project.status) {
    case 'development':
      return 'En desarrollo';
    case 'production':
      return 'Entregado';
    case 'maintenance':
      return 'Mantenimiento';
    case 'paused':
      return 'Pausado';
    default:
      return getProjectProgress(project) === 100 ? 'Entregado' : 'En desarrollo';
  }
}

export function getProjectStateVariant(project: ProjectsPageProject): BadgeProps['variant'] {
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

export function getProjectsAverageProgress(projects: ProjectsPageProject[]): number {
  if (projects.length === 0) {
    return 0;
  }

  return Math.round(
    projects.reduce((total, project) => total + getProjectProgress(project), 0) / projects.length
  );
}

export function getProjectsTaskStats(projects: ProjectsPageProject[]) {
  return projects.reduce(
    (accumulator, project) => {
      const projectStats = getProjectTaskStats(project);
      return {
        completed: accumulator.completed + projectStats.completed,
        total: accumulator.total + projectStats.total
      };
    },
    { completed: 0, total: 0 }
  );
}

export function getProjectsSummaryStatus(projects: ProjectsPageProject[]): string {
  if (projects.length === 0) {
    return 'Sin datos';
  }

  const uniqueStatuses = new Set(projects.map((project) => getProjectStateLabel(project)));

  if (uniqueStatuses.size === 1) {
    return Array.from(uniqueStatuses)[0] ?? 'Sin datos';
  }

  return 'Mixto';
}
