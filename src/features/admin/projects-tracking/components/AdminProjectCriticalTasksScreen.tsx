import { useState } from 'react';
import { AlertCircle, ListTodo, Plus } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectCriticalTaskCard } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskCard';
import { AdminProjectCriticalTasksEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksEmptyState';
import { AdminProjectCriticalTasksFilters } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksFilters';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { getAdminProjectCriticalTaskResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskResolution.utils';
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

  const handleSubmitTask = async (
    input: Parameters<typeof saveTask>[0],
    currentTaskKey?: string,
  ) => {
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
    {
      status = task.status,
      priority = task.priority ?? 'alta',
    }: { status?: string; priority?: string },
  ) => {
    await saveTask(
      {
        title: task.title,
        description: task.description ?? '',
        status,
        priority,
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

        <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Tareas críticas</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Lectura prioritaria de tareas</h1>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Acá se concentran los desvíos operativos que hoy necesitan atención del equipo Pulse.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                <ListTodo className="h-4 w-4" />
                <span>{criticalTasks.length} tareas priorizadas</span>
              </div>
              <Button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear tarea
              </Button>
            </div>
          </div>

          {criticalTasks.length > 0 ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <AdminProjectCriticalTasksFilters
                activeFilter={activeFilter}
                items={criticalTasks}
                onChange={setActiveFilter}
              />
            </div>
          ) : null}
        </section>

        {criticalTasks.length === 0 ? (
          <AdminProjectCriticalTasksEmptyState onEditProject={onEditProject} />
        ) : visibleTasks.length === 0 ? (
          <section className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-surface)]/70 p-8">
            <div className="mx-auto max-w-2xl space-y-2 text-center">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">No hay tareas en este filtro</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Pulse no detecta tareas {activeFilter === 'blocked' ? 'bloqueadas' : activeFilter === 'overdue' ? 'vencidas' : 'sin responsable'} en este momento.
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            {visibleTasks.map((item) => (
              <AdminProjectCriticalTaskCard
                key={item.task.key}
                item={item}
                projectId={project.id}
                quickActions={getAdminProjectCriticalTaskResolutionActions({
                  task: item.task,
                  saving: savingTask,
                  onOpenEdit: () => setTaskDraft(item.task),
                  onUpdateStatus: (status) => void handleQuickTaskUpdate(item.task, { status }),
                  onUpdatePriority: (priority) => void handleQuickTaskUpdate(item.task, { priority }),
                }).slice(0, 2)}
              />
            ))}
          </section>
        )}
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
