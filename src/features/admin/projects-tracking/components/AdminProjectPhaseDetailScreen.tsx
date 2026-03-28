import { useState } from 'react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminProjectPhaseDetailHero } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailHero';
import { AdminProjectPhaseDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailSummary';
import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectPhaseTasksList } from '@/features/admin/projects-tracking/components/AdminProjectPhaseTasksList';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingContextBanner } from '@/features/admin/projects-tracking/components/AdminProjectTrackingContextBanner';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingResolutionPanel } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import { getAdminProjectCriticalTaskResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectCriticalTaskResolution.utils';
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
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando detalle de la fase...</span>
        </div>
      </div>
    );
  }

  if (error || !project || !phase) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos abrir esta fase"
        description={error ?? 'La fase no existe o todavía no está disponible en la base operativa.'}
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
    await savePhase(
      {
        descripcion: phase.descripcion ?? phase.key,
        estado: nextStatus,
        responsable: phase.responsable ?? '',
        fechaEntrega: phase.fechaEntrega ?? phase.fechaFin ?? '',
      },
      phase.key,
    );
  };

  const handleQuickTaskUpdate = async (
    task: AdminProjectTrackingTask,
    { priority = task.priority ?? 'alta', status = task.status }: { status?: string; priority?: string },
  ) => {
    await saveTask(
      {
        title: task.title,
        description: task.description ?? '',
        status,
        priority,
        responsable: task.responsable ?? task.assigned_to ?? '',
        fechaLimite: task.fechaLimite ?? task.dueDate ?? '',
        phaseKey: phase.key,
      },
      task.key,
    );
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
            ctaLabel="Abrir edición completa"
            description="Pulse detectó un desvío en esta fase. Revisá el contexto y abrí la edición completa solo si necesitás ajustar responsable, fecha objetivo o estado."
            onOpenEdit={() => setShowEditDialog(true)}
          />
        ) : null}
        <AdminProjectTrackingResolutionPanel actions={resolutionActions} />
        <AdminProjectPhaseDetailSummary phase={phase} />
        <AdminProjectPhaseTasksList
          tasks={phase.tareas}
          onEditTask={setTaskDraft}
          getQuickActions={(task) =>
            getAdminProjectCriticalTaskResolutionActions({
              task,
              saving: savingTask,
              onOpenEdit: () => setTaskDraft(task),
              onUpdateStatus: (status) => void handleQuickTaskUpdate(task, { status }),
              onUpdatePriority: (priority) => void handleQuickTaskUpdate(task, { priority }),
            }).slice(0, 2)
          }
        />
      </div>

      <AdminProjectPhaseDialog
        open={showEditDialog}
        saving={savingPhase}
        phase={phase}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmitPhase}
      />
      <AdminProjectTaskDialog
        open={showCreateTaskDialog || taskDraft !== null}
        saving={savingTask}
        task={taskDraft}
        phases={project.phases}
        fixedPhaseKey={phase.key}
        onClose={() => {
          setShowCreateTaskDialog(false);
          setTaskDraft(null);
        }}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
