import { AlertCircle, CalendarClock, KanbanSquare, ShieldAlert, UserRound } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminProjectTrackingEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingEmptyState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';

interface AdminProjectTrackingScreenProps {
  projectId: string | undefined;
  onBack: () => void;
  onEditProject: () => void;
  refreshSignal?: number;
}

export function AdminProjectTrackingScreen({
  projectId,
  onBack,
  onEditProject,
  refreshSignal = 0,
}: AdminProjectTrackingScreenProps) {
  const { loading, error, project, refresh } = useAdminProjectTracking(projectId, refreshSignal);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando seguimiento operativo del proyecto...</span>
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
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No pudimos cargar el seguimiento del proyecto
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'El proyecto no está disponible en la base operativa.'}
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

  const totalTasks = project.rootTasks.length + project.phases.reduce((acc, phase) => acc + phase.tareas.length, 0);

  return (
    <div className="space-y-6">
      <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

      <section id="resumen" className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <KanbanSquare className="mb-3 h-5 w-5 text-signal" />
          <p className="text-sm text-[var(--text-secondary)]">Fases cargadas</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{project.phases.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <ShieldAlert className="mb-3 h-5 w-5 text-amber-300" />
          <p className="text-sm text-[var(--text-secondary)]">Tareas operativas</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{totalTasks}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <UserRound className="mb-3 h-5 w-5 text-emerald-300" />
          <p className="text-sm text-[var(--text-secondary)]">Responsables visibles</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
            {project.phases.filter((phase) => Boolean(phase.responsable)).length}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <CalendarClock className="mb-3 h-5 w-5 text-sky-300" />
          <p className="text-sm text-[var(--text-secondary)]">Avance declarado</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{project.completionPercentage}%</p>
        </div>
      </section>

      {project.phases.length === 0 && project.rootTasks.length === 0 ? (
        <AdminProjectTrackingEmptyState onBack={onBack} onEditProject={onEditProject} />
      ) : (
        <>
          <section
            id="fases"
            className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Base de seguimiento lista</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                El proyecto ya tiene estructura de seguimiento cargada. Desde la navegación lateral ya podés entrar a
                fases, tareas críticas y alertas para leer cada desvío operativo por separado.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-surface)]/70 p-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Consola lista para operar</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                La pantalla ya quedó preparada para separar resumen, fases, tareas críticas y alertas sin volver al
                panel legacy ni mezclar contextos.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
