import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminProjectCriticalTasksHero } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksHero';
import { AdminProjectCriticalTasksResults } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksResults';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import {
  filterAdminProjectCriticalTasks,
  getAdminProjectCriticalTasks,
  type AdminProjectCriticalTaskFilter,
} from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectCriticalTasksScreenProps {
  projectId: string | undefined;
  onEditProject: () => void;
}

export function AdminProjectCriticalTasksScreen({
  projectId,
  onEditProject,
}: AdminProjectCriticalTasksScreenProps) {
  const { loading, savingTask, error, project, refresh, saveTask } = useAdminProjectTracking(projectId);
  const [activeFilter, setActiveFilter] = useState<AdminProjectCriticalTaskFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskDraft, setTaskDraft] = useState<AdminProjectTrackingTask | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando tareas críticas del proyecto...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <section className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos cargar las tareas críticas</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'La lectura operativa del proyecto no está disponible ahora.'}
              </p>
            </div>
            <button className="text-sm font-medium text-signal" onClick={() => void refresh()}>
              Reintentar carga
            </button>
          </div>
        </div>
      </section>
    );
  }

  const criticalTasks = getAdminProjectCriticalTasks(project);
  const visibleTasks = filterAdminProjectCriticalTasks(criticalTasks, activeFilter);

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask(
      {
        ...input,
        phaseKey: taskDraft?.source.phaseKey ?? input.phaseKey,
      },
      currentTaskKey,
    );

    if (success) {
      setShowCreateDialog(false);
      setTaskDraft(null);
      setActiveFilter('all');
    }
  };

  const handleQuickTaskUpdate = async (
    task: AdminProjectTrackingTask,
    patch: { status?: string; priority?: string },
  ) => {
    await saveTask(
      {
        title: task.title,
        description: task.description ?? '',
        status: patch.status ?? task.status,
        priority: patch.priority ?? task.priority ?? 'alta',
        responsable: task.responsable ?? task.assigned_to ?? '',
        fechaLimite: task.fechaLimite ?? task.dueDate ?? '',
        phaseKey: task.source.phaseKey,
      },
      task.key,
    );
  };

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

        <AdminProjectCriticalTasksHero
          activeFilter={activeFilter}
          items={criticalTasks}
          onChangeFilter={setActiveFilter}
          onCreateTask={() => setShowCreateDialog(true)}
        />

        <AdminProjectCriticalTasksResults
          activeFilter={activeFilter}
          items={criticalTasks}
          projectId={project.id}
          savingTask={savingTask}
          visibleItems={visibleTasks}
          onOpenEditTask={setTaskDraft}
          onUpdateTask={(task, patch) => void handleQuickTaskUpdate(task, patch)}
        />
      </div>

      <AdminProjectTaskDialog
        open={showCreateDialog || taskDraft !== null}
        saving={savingTask}
        task={taskDraft}
        phases={project.phases}
        fixedPhaseKey={taskDraft?.source.phaseKey}
        onClose={() => {
          setShowCreateDialog(false);
          setTaskDraft(null);
        }}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
