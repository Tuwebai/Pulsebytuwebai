import { useState } from 'react';

import { AdminProjectCriticalTaskDetailDialogs } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailDialogs';
import { AdminProjectCriticalTaskDetailHero } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailHero';
import { AdminProjectCriticalTaskDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailSummary';
import { AdminProjectTrackingContextBanner } from '@/features/admin/projects-tracking/components/AdminProjectTrackingContextBanner';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingLoadingState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLoadingState';
import { AdminProjectTrackingResolutionPanel } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import { getAdminProjectCriticalTaskByKey } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { getAdminProjectCriticalTaskDetailInput } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskDetail.utils';
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
    return <AdminProjectTrackingLoadingState message="Cargando detalle de la tarea critica..." />;
  }

  if (error || !project || !item) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos abrir esta tarea critica"
        description={error ?? 'La tarea no existe o ya no requiere atencion prioritaria.'}
        backLabel={backLabel}
        onBack={onBackToTasks}
        onRetry={() => refresh()}
      />
    );
  }

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask({ ...input, phaseKey: item.task.source.phaseKey }, currentTaskKey);
    if (success) {
      setShowEditDialog(false);
    }
  };

  const handleQuickTaskUpdate = async (overrides: { priority?: string; status?: string }) => {
    await saveTask(getAdminProjectCriticalTaskDetailInput(item, overrides), item.task.key);
  };

  const resolutionActions = getAdminProjectCriticalTaskResolutionActions({
    task: item.task,
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
            ctaLabel="Abrir edicion completa"
            description="Pulse te trajo desde alertas porque esta tarea necesita correccion. Revisa el contexto y abri la edicion completa solo si necesitas ajustar responsable, prioridad, fecha objetivo o estado."
            onOpenEdit={() => setShowEditDialog(true)}
          />
        ) : null}
        <AdminProjectTrackingResolutionPanel actions={resolutionActions} />
        <AdminProjectCriticalTaskDetailSummary item={item} />
      </div>

      <AdminProjectCriticalTaskDetailDialogs
        item={item}
        open={showEditDialog}
        project={project}
        saving={savingTask}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
