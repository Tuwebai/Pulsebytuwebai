import { AdminProjectAlertCard } from '@/features/admin/projects-tracking/components/AdminProjectAlertCard';
import { AdminProjectAlertsEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectAlertsEmptyState';
import { AdminProjectAlertsHero } from '@/features/admin/projects-tracking/components/AdminProjectAlertsHero';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingLoadingState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLoadingState';
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
    return <AdminProjectTrackingLoadingState message="Cargando alertas operativas del proyecto..." />;
  }

  if (error || !project) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos cargar las alertas del proyecto"
        description={error ?? 'La lectura operativa del proyecto no esta disponible ahora.'}
        backLabel="Volver al seguimiento"
        onBack={onBackToTracking}
        onRetry={() => refresh()}
      />
    );
  }

  const alerts = getAdminProjectAlerts(project);
  const highAlerts = alerts.filter((item) => item.severity === 'high');
  const mediumAlerts = alerts.filter((item) => item.severity === 'medium');

  return (
    <div className="space-y-6">
      <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />
      <AdminProjectAlertsHero
        highAlertsCount={highAlerts.length}
        mediumAlertsCount={mediumAlerts.length}
        totalAlertsCount={alerts.length}
      />
      {alerts.length === 0 ? (
        <AdminProjectAlertsEmptyState onBackToTracking={onBackToTracking} />
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
