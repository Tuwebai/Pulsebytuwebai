import { AlertCircle, AlertTriangle, ShieldAlert, TriangleAlert } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminProjectAlertCard } from '@/features/admin/projects-tracking/components/AdminProjectAlertCard';
import { AdminProjectAlertsEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectAlertsEmptyState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { getAdminProjectAlerts } from '@/features/admin/projects-tracking/components/adminProjectAlerts.utils';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';

interface AdminProjectAlertsScreenProps {
  projectId: string | undefined;
  onBackToTracking: () => void;
  onEditProject: () => void;
}

export function AdminProjectAlertsScreen({
  projectId,
  onBackToTracking,
  onEditProject,
}: AdminProjectAlertsScreenProps) {
  const { loading, error, project, refresh } = useAdminProjectTracking(projectId);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando alertas operativas del proyecto...</span>
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
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos cargar las alertas del proyecto</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'La lectura operativa del proyecto no está disponible ahora.'}
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

  const alerts = getAdminProjectAlerts(project);
  const highAlerts = alerts.filter((item) => item.severity === 'high');
  const mediumAlerts = alerts.filter((item) => item.severity === 'medium');

  return (
    <div className="space-y-6">
      <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

      <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Alertas</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Desvíos operativos detectados</h1>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Pulse resume bloqueos, vencimientos y owners faltantes para que el equipo entre directo al punto que hoy frena el proyecto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:min-w-[320px] sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4">
              <ShieldAlert className="mb-2 h-4 w-4 text-rose-300" />
              <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">Altas</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{highAlerts.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4">
              <TriangleAlert className="mb-2 h-4 w-4 text-amber-300" />
              <p className="text-xs uppercase tracking-[0.16em] text-amber-200/80">Medias</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{mediumAlerts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <AlertTriangle className="mb-2 h-4 w-4 text-signal" />
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Total</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{alerts.length}</p>
            </div>
          </div>
        </div>
      </section>

      {alerts.length === 0 ? (
        <AdminProjectAlertsEmptyState onBackToTracking={onBackToTracking} onEditProject={onEditProject} />
      ) : (
        <section className="space-y-4">
          {alerts.map((item) => (
            <AdminProjectAlertCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
