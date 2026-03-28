import { AlertCircle, ArrowLeft } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectPhaseDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailSummary';
import { AdminProjectPhaseTasksList } from '@/features/admin/projects-tracking/components/AdminProjectPhaseTasksList';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';

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
  const { loading, error, project, refresh } = useAdminProjectTracking(projectId);
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

  return (
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
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-4 py-2 text-sm font-medium text-emerald-300">
            {phase.estado}
          </span>
        </div>
      </section>

      <AdminProjectPhaseDetailSummary phase={phase} />
      <AdminProjectPhaseTasksList tasks={phase.tareas} />
    </div>
  );
}
