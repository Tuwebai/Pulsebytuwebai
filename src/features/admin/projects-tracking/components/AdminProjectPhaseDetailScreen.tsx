import { useState } from 'react';
import { AlertCircle, ArrowLeft, Plus, SquarePen } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectPhaseDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailSummary';
import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectPhaseTasksList } from '@/features/admin/projects-tracking/components/AdminProjectPhaseTasksList';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';
import type { AdminProjectTrackingTask } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailScreenProps {
  phaseKey: string | undefined;
  projectId: string | undefined;
  onBackToPhases: () => void;
  onEditProject: () => void;
}

export function AdminProjectPhaseDetailScreen({
  phaseKey,
  projectId,
  onBackToPhases,
  onEditProject,
}: AdminProjectPhaseDetailScreenProps) {
  const { loading, savingPhase, savingTask, error, project, refresh, savePhase, saveTask } = useAdminProjectTracking(projectId);
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
                Volver a fases
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
                Volver a fases
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
