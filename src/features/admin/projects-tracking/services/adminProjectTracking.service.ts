import {
  fetchAdminProjectTracking,
  updateAdminProjectTrackingPhases,
  updateAdminProjectTrackingProject,
} from '@/api/admin/adminProjectTracking.api';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';
import { mapAdminProjectTrackingProject } from '@/features/admin/projects-tracking/services/adminProjectTracking.read-model';
import { buildStoredPhase, buildStoredTask } from '@/features/admin/projects-tracking/services/adminProjectTracking.write-model';

export async function getAdminProjectTracking(projectId: string): Promise<AdminProjectTrackingProject> {
  const row = await fetchAdminProjectTracking(projectId);
  return mapAdminProjectTrackingProject(row);
}

export async function saveAdminProjectTrackingPhase(
  project: AdminProjectTrackingProject,
  input: AdminProjectTrackingPhaseInput,
  currentPhaseKey?: string,
): Promise<AdminProjectTrackingProject> {
  const currentPhase = currentPhaseKey
    ? project.phases.find((phase) => phase.key === currentPhaseKey)
    : undefined;

  const nextPhase = buildStoredPhase(input, currentPhase);
  const nextPhases = currentPhase
    ? project.phases.map((phase) => (phase.key === currentPhase.key ? nextPhase : phase.raw))
    : [...project.phases.map((phase) => phase.raw), nextPhase];

  await updateAdminProjectTrackingPhases(project.id, nextPhases);
  return getAdminProjectTracking(project.id);
}

export async function saveAdminProjectTrackingTask(
  project: AdminProjectTrackingProject,
  input: AdminProjectTrackingTaskInput,
  currentTaskKey?: string,
): Promise<AdminProjectTrackingProject> {
  const currentTask = currentTaskKey
    ? [...project.rootTasks, ...project.phases.flatMap((phase) => phase.tareas)].find((task) => task.key === currentTaskKey)
    : undefined;

  const targetPhaseKey = currentTask?.source.phaseKey ?? input.phaseKey;
  const nextTask = buildStoredTask(input, currentTask);

  const nextRootTasks = currentTask?.source.type === 'root'
    ? project.rootTasks.map((task) => (task.key === currentTask.key ? nextTask : task.raw))
    : !currentTask && !targetPhaseKey
      ? [...project.rootTasks.map((task) => task.raw), nextTask]
      : project.rootTasks.map((task) => task.raw);

  const nextPhases = project.phases.map((phase) => {
    const currentTasks = phase.tareas.map((task) => task.raw);

    if (currentTask?.source.type === 'phase' && phase.key === currentTask.source.phaseKey) {
      return {
        ...phase.raw,
        tareas: phase.tareas.map((task) => (task.key === currentTask.key ? nextTask : task.raw)),
      };
    }

    if (!currentTask && targetPhaseKey && phase.key === targetPhaseKey) {
      return {
        ...phase.raw,
        tareas: [...currentTasks, nextTask],
      };
    }

    return {
      ...phase.raw,
      tareas: currentTasks,
    };
  });

  await updateAdminProjectTrackingProject(project.id, {
    fases: nextPhases,
    tareas: nextRootTasks,
  });

  return getAdminProjectTracking(project.id);
}
