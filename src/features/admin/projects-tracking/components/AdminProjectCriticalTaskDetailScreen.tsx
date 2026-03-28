import { useState } from 'react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminProjectCriticalTaskDetailHero } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailHero';
import { AdminProjectCriticalTaskDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailSummary';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingContextBanner } from '@/features/admin/projects-tracking/components/AdminProjectTrackingContextBanner';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingResolutionPanel } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import { getAdminProjectCriticalTaskByKey } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { getAdminProjectCriticalTaskResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskResolution.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';

interface AdminProjectCriticalTaskDetailScreenProps {
  projectId: string | undefined;
  taskKey: string | undefined;
  onBackToTasks: () => void;
  backLabel: string;
  fromAlerts: boolean;
  startInEditMode: boolean;
  onEditProject: () => void;
}

export function AdminProjectCriticalTaskDetailScreen({
  projectId,
  taskKey,
  onBackToTasks,
  backLabel,
  fromAlerts,
  startInEditMode,
  onEditProject,
}: AdminProjectCriticalTaskDetailScreenProps) {
  const { loading, savingTask, error, project, refresh, saveTask } = useAdminProjectTracking(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const item = project && taskKey ? getAdminProjectCriticalTaskByKey(project, taskKey) : null;

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando detalle de la tarea crítica...</span>
        </div>
      </div>
    );
  }

  if (error || !project || !item) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos abrir esta tarea crítica"
        description={error ?? 'La tarea no existe o ya no requiere atención prioritaria.'}
        backLabel={backLabel}
        onBack={onBackToTasks}
        onRetry={() => refresh()}
      />
    );
  }

  const { task } = item;

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask({ ...input, phaseKey: task.source.phaseKey }, currentTaskKey);
    if (success) {
      setShowEditDialog(false);
    }
  };

  const handleQuickTaskUpdate = async ({
    priority = task.priority ?? 'alta',
    status = task.status,
  }: {
    status?: string;
    priority?: string;
  }) => {
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

  const resolutionActions = getAdminProjectCriticalTaskResolutionActions({
    task,
    saving: savingTask,
    onOpenEdit: () => setShowEditDialog(true),
    onUpdateStatus: (status) => void handleQuickTaskUpdate({ status }),
    onUpdatePriority: (priority) => void handleQuickTaskUpdate({ priority }),
  });

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />
        <AdminProjectCriticalTaskDetailHero
          backLabel={backLabel}
          item={item}
          onBackToTasks={onBackToTasks}
          onEditTask={() => setShowEditDialog(true)}
        />
        {fromAlerts && startInEditMode ? (
          <AdminProjectTrackingContextBanner
            ctaLabel="Abrir edición completa"
            description="Pulse te trajo desde alertas porque esta tarea necesita corrección. Revisá el contexto y abrí la edición completa solo si necesitás ajustar responsable, prioridad, fecha objetivo o estado."
            onOpenEdit={() => setShowEditDialog(true)}
          />
        ) : null}
        <AdminProjectTrackingResolutionPanel actions={resolutionActions} />
        <AdminProjectCriticalTaskDetailSummary item={item} />
      </div>

      <AdminProjectTaskDialog
        open={showEditDialog}
        saving={savingTask}
        task={task}
        phases={project.phases}
        fixedPhaseKey={task.source.phaseKey}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
