import { useState } from 'react';

import { AdminProjectPhaseCard } from '@/features/admin/projects-tracking/components/AdminProjectPhaseCard';
import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectPhasesEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectPhasesEmptyState';
import { AdminProjectPhasesHero } from '@/features/admin/projects-tracking/components/AdminProjectPhasesHero';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingLoadingState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLoadingState';
import { getAdminProjectPhaseStatusInput } from '@/features/admin/projects-tracking/components/adminProjectPhaseDetail.utils';
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
    return <AdminProjectTrackingLoadingState message="Cargando fases operativas del proyecto..." />;
  }

  if (error || !project) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos cargar las fases del proyecto"
        description={error ?? 'Las fases no están disponibles en la base operativa.'}
        backLabel="Volver al seguimiento"
        onBack={onBack}
        onRetry={() => refresh()}
      />
    );
  }

  const closeDialog = () => {
    setShowCreateDialog(false);
    setPhaseDraft(null);
  };

  const handleSubmitPhase = async (input: Parameters<typeof savePhase>[0], currentPhaseKey?: string) => {
    const success = await savePhase(input, currentPhaseKey ?? phaseDraft?.key);
    if (success) {
      closeDialog();
    }
  };

  const handleQuickPhaseStatus = async (phase: AdminProjectTrackingPhase, nextStatus: string) => {
    await savePhase(getAdminProjectPhaseStatusInput(phase, nextStatus), phase.key);
  };

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />
        <AdminProjectPhasesHero
          phasesCount={project.phases.length}
          onCreatePhase={() => setShowCreateDialog(true)}
        />
        {project.phases.length === 0 ? (
          <AdminProjectPhasesEmptyState onBack={onBack} onEditProject={onEditProject} />
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
        onClose={closeDialog}
        onSubmit={handleSubmitPhase}
      />
    </>
  );
}
