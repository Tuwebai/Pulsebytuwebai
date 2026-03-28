import { useState } from 'react';
import { AlertCircle, KanbanSquare, Plus } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectPhaseCard } from '@/features/admin/projects-tracking/components/AdminProjectPhaseCard';
import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectPhasesEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectPhasesEmptyState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { getAdminProjectPhaseResolutionActions } from '@/features/admin/projects-tracking/components/adminProjectPhaseResolution.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';
import type { AdminProjectTrackingPhase } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhasesScreenProps {
  projectId: string | undefined;
  onBack: () => void;
  onEditProject: () => void;
}

export function AdminProjectPhasesScreen({
  projectId,
  onBack,
  onEditProject,
}: AdminProjectPhasesScreenProps) {
  const { loading, savingPhase, error, project, refresh, savePhase } = useAdminProjectTracking(projectId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [phaseDraft, setPhaseDraft] = useState<AdminProjectTrackingPhase | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando fases operativas del proyecto...</span>
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
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos cargar las fases del proyecto</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'Las fases no están disponibles en la base operativa.'}
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

  const handleCreatePhase = async () => {
    setShowCreateDialog(true);
  };

  const handleSubmitPhase = async (
    input: Parameters<typeof savePhase>[0],
    currentPhaseKey?: string,
  ) => {
    const success = await savePhase(input, currentPhaseKey ?? phaseDraft?.key);
    if (success) {
      setShowCreateDialog(false);
      setPhaseDraft(null);
    }
  };

  const handleQuickPhaseStatus = async (phase: AdminProjectTrackingPhase, nextStatus: string) => {
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

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

        <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Fases</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Seguimiento por etapas</h1>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Leé el estado del proyecto por fase, responsable y fecha objetivo sin salir del contexto operativo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <KanbanSquare className="h-4 w-4" />
                <span>{project.phases.length} fases cargadas</span>
              </div>
              <Button
                type="button"
                onClick={handleCreatePhase}
                className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear fase
              </Button>
            </div>
          </div>
        </section>

        {project.phases.length === 0 ? (
          <AdminProjectPhasesEmptyState
            onBack={onBack}
            onEditProject={onEditProject}
          />
        ) : (
          <section className="space-y-4">
            {project.phases.map((phase, index) => (
              <AdminProjectPhaseCard
                key={phase.key}
                index={index}
                phase={phase}
                projectId={project.id}
                quickActions={getAdminProjectPhaseResolutionActions({
                  phase,
                  saving: savingPhase,
                  onOpenEdit: () => setPhaseDraft(phase),
                  onUpdateStatus: (status) => void handleQuickPhaseStatus(phase, status),
                }).slice(0, 2)}
              />
            ))}
          </section>
        )}
      </div>

      <AdminProjectPhaseDialog
        open={showCreateDialog || phaseDraft !== null}
        saving={savingPhase}
        phase={phaseDraft}
        onClose={() => {
          setShowCreateDialog(false);
          setPhaseDraft(null);
        }}
        onSubmit={handleSubmitPhase}
      />
    </>
  );
}
