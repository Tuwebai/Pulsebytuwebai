import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Plus, SquarePen } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectPhaseDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailSummary';
import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectPhaseTasksList } from '@/features/admin/projects-tracking/components/AdminProjectPhaseTasksList';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingResolutionPanel } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';
import {
  isAdminProjectTrackingDoneStatus,
  isAdminProjectTrackingOverdue,
} from '@/features/admin/projects-tracking/components/adminProjectTrackingResolution.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailScreenProps {
  phaseKey: string | undefined;
  projectId: string | undefined;
  onBackToPhases: () => void;
  backLabel: string;
  startInEditMode: boolean;
  onEditProject: () => void;
}

export function AdminProjectPhaseDetailScreen({
  phaseKey,
  projectId,
  onBackToPhases,
  backLabel,
  startInEditMode,
  onEditProject,
}: AdminProjectPhaseDetailScreenProps) {
  const { loading, savingPhase, savingTask, error, project, refresh, savePhase, saveTask } = useAdminProjectTracking(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [taskDraft, setTaskDraft] = useState<AdminProjectTrackingTask | null>(null);
  const phase = project?.phases.find((currentPhase) => currentPhase.key === phaseKey);

  useEffect(() => {
    if (startInEditMode && phase) {
      setShowEditDialog(true);
    }
  }, [startInEditMode, phase]);

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
      <section className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos abrir esta fase</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'La fase no existe o todavía no está disponible en la base operativa.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="text-sm font-medium text-signal" onClick={() => void refresh()}>
                Reintentar carga
              </button>
              <button className="text-sm font-medium text-[var(--text-secondary)]" onClick={onBackToPhases}>
                {backLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmitPhase = async (input: Parameters<typeof savePhase>[0], currentPhaseKey?: string) => {
    const success = await savePhase(input, currentPhaseKey);
    if (success) {
      setShowEditDialog(false);
    }
  };

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask(
      {
        ...input,
        phaseKey: phase.key,
      },
      currentTaskKey,
    );
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

  const targetDate = phase.fechaEntrega ?? phase.fechaFin;
  const resolutionActionsDraft: Array<AdminProjectTrackingResolutionAction | null> = [
    !phase.responsable
      ? {
          id: 'phase-owner',
          title: 'Asignar responsable',
          description: 'Esta fase sigue sin owner visible. Definirlo ahora evita más desvíos de seguimiento.',
          ctaLabel: 'Asignar owner',
          icon: 'owner' as const,
          disabled: savingPhase,
          onClick: () => setShowEditDialog(true),
        }
      : null,
    !targetDate
      ? {
          id: 'phase-date-missing',
          title: 'Definir fecha objetivo',
          description: 'Pulse necesita una fecha visible para medir desvío y priorizar esta etapa correctamente.',
          ctaLabel: 'Definir fecha',
          icon: 'date' as const,
          disabled: savingPhase,
          onClick: () => setShowEditDialog(true),
        }
      : isAdminProjectTrackingOverdue(targetDate) && !isAdminProjectTrackingDoneStatus(phase.estado)
        ? {
            id: 'phase-date-overdue',
            title: 'Actualizar fecha objetivo',
            description: 'La fecha actual ya venció y la fase sigue abierta. Conviene replanificar o cerrar la etapa.',
            ctaLabel: 'Actualizar fecha',
            icon: 'date' as const,
            disabled: savingPhase,
            onClick: () => setShowEditDialog(true),
          }
        : null,
    phase.estado !== 'En Progreso'
      ? {
          id: 'phase-progress',
          title: 'Mover a en progreso',
          description: 'Si la etapa ya está activa, marcala en progreso para reflejar el estado operativo real.',
          ctaLabel: 'Marcar en progreso',
          icon: 'owner' as const,
          disabled: savingPhase,
          onClick: () => void handleQuickPhaseStatus('En Progreso'),
        }
      : null,
    !isAdminProjectTrackingDoneStatus(phase.estado)
      ? {
          id: 'phase-done',
          title: 'Cerrar fase',
          description: 'Si esta etapa ya quedó resuelta, podés marcarla terminada y sacar el desvío del radar.',
          ctaLabel: 'Marcar terminada',
          icon: 'date' as const,
          disabled: savingPhase,
          onClick: () => void handleQuickPhaseStatus('Terminada'),
        }
      : null,
  ];
  const resolutionActions = resolutionActionsDraft.filter(
    (action): action is AdminProjectTrackingResolutionAction => action !== null,
  );

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

        <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                onClick={onBackToPhases}
                className="mb-2 h-auto px-0 text-[var(--text-secondary)] hover:bg-transparent hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Detalle de fase</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {phase.descripcion ?? phase.key}
              </h1>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Vista puntual de estado, responsable, fecha objetivo y tareas asociadas a esta etapa del proyecto.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-4 py-2 text-sm font-medium text-emerald-300">
                {phase.estado}
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => setShowCreateTaskDialog(true)}
                  className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear tarea
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                  className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <SquarePen className="mr-2 h-4 w-4" />
                  Editar fase
                </Button>
              </div>
            </div>
          </div>
        </section>

        <AdminProjectTrackingResolutionPanel actions={resolutionActions} />
        <AdminProjectPhaseDetailSummary phase={phase} />
        <AdminProjectPhaseTasksList
          tasks={phase.tareas}
          onCreateTask={() => setShowCreateTaskDialog(true)}
          onEditTask={setTaskDraft}
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
