import { useState } from 'react';

import { AdminProjectPhaseDetailDialogs } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailDialogs';
import { AdminProjectPhaseDetailHero } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailHero';
import { AdminProjectPhaseDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailSummary';
import { AdminProjectPhaseTasksList } from '@/features/admin/projects-tracking/components/AdminProjectPhaseTasksList';
import { AdminProjectTrackingContextBanner } from '@/features/admin/projects-tracking/components/AdminProjectTrackingContextBanner';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingLoadingState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLoadingState';
import { AdminProjectTrackingResolutionPanel } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import {
  getAdminProjectPhaseStatusInput,
  getAdminProjectPhaseTaskInput,
  getAdminProjectPhaseTaskQuickActions,
} from '@/features/admin/projects-tracking/components/adminProjectPhaseDetail.utils';
import { getAdminProjectPhaseResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectPhaseResolution.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailScreenProps {
  phaseKey: string | undefined;
  projectId: string | undefined;
  onBackToPhases: () => void;
  backLabel: string;
  fromAlerts: boolean;
  startInEditMode: boolean;
  onEditProject: () => void;
}

export function AdminProjectPhaseDetailScreen({
  phaseKey,
  projectId,
  onBackToPhases,
  backLabel,
  fromAlerts,
  startInEditMode,
  onEditProject,
}: AdminProjectPhaseDetailScreenProps) {
  const { loading, savingPhase, savingTask, error, project, refresh, savePhase, saveTask } =
    useAdminProjectTracking(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [taskDraft, setTaskDraft] = useState<AdminProjectTrackingTask | null>(null);
  const phase = project?.phases.find((currentPhase) => currentPhase.key === phaseKey);

  if (loading) {
    return <AdminProjectTrackingLoadingState message="Cargando detalle de la fase..." />;
  }

  if (error || !project || !phase) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos abrir esta fase"
        description={error ?? 'La fase no existe o todavia no esta disponible en la base operativa.'}
        backLabel={backLabel}
        onBack={onBackToPhases}
        onRetry={() => refresh()}
      />
    );
  }

  const handleSubmitPhase = async (input: Parameters<typeof savePhase>[0], currentPhaseKey?: string) => {
    const success = await savePhase(input, currentPhaseKey);
    if (success) {
      setShowEditDialog(false);
    }
  };

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask({ ...input, phaseKey: phase.key }, currentTaskKey);
    if (success) {
      setShowCreateTaskDialog(false);
      setTaskDraft(null);
    }
  };

  const handleQuickPhaseStatus = async (nextStatus: string) => {
    await savePhase(getAdminProjectPhaseStatusInput(phase, nextStatus), phase.key);
  };

  const handleQuickTaskUpdate = async (
    task: AdminProjectTrackingTask,
    overrides: { priority?: string; status?: string },
  ) => {
    await saveTask(getAdminProjectPhaseTaskInput(task, phase.key, overrides), task.key);
  };

  const resolutionActions = getAdminProjectPhaseResolutionActions({
    phase,
    saving: savingPhase,
    onOpenEdit: () => setShowEditDialog(true),
    onUpdateStatus: (status) => void handleQuickPhaseStatus(status),
  });

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />
        <AdminProjectPhaseDetailHero
          phase={phase}
          backLabel={backLabel}
          onBackToPhases={onBackToPhases}
          onCreateTask={() => setShowCreateTaskDialog(true)}
          onEditPhase={() => setShowEditDialog(true)}
        />
        {fromAlerts && startInEditMode ? (
          <AdminProjectTrackingContextBanner
            ctaLabel="Abrir edicion completa"
            description="Pulse detecto un desvio en esta fase. Revisa el contexto y abri la edicion completa solo si necesitas ajustar responsable, fecha objetivo o estado."
            onOpenEdit={() => setShowEditDialog(true)}
          />
        ) : null}
        <AdminProjectTrackingResolutionPanel actions={resolutionActions} />
        <AdminProjectPhaseDetailSummary phase={phase} />
        <AdminProjectPhaseTasksList
          tasks={phase.tareas}
          onEditTask={setTaskDraft}
          getQuickActions={(task) =>
            getAdminProjectPhaseTaskQuickActions({
              task,
              saving: savingTask,
              onOpenEdit: () => setTaskDraft(task),
              onSaveTask: (overrides) => handleQuickTaskUpdate(task, overrides),
            })
          }
        />
      </div>

      <AdminProjectPhaseDetailDialogs
        phase={phase}
        project={project}
        savingPhase={savingPhase}
        savingTask={savingTask}
        showCreateTaskDialog={showCreateTaskDialog}
        showEditDialog={showEditDialog}
        taskDraft={taskDraft}
        onClosePhaseDialog={() => setShowEditDialog(false)}
        onCloseTaskDialog={() => {
          setShowCreateTaskDialog(false);
          setTaskDraft(null);
        }}
        onSubmitPhase={handleSubmitPhase}
        onSubmitTask={handleSubmitTask}
      />
    </>
  );
}
