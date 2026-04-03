import { CalendarClock, KanbanSquare, ShieldAlert, UserRound } from 'lucide-react';

import { AdminProjectTrackingEmptyState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingEmptyState';
import { AdminProjectTrackingErrorState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingErrorState';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { AdminProjectTrackingLoadingState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLoadingState';
import { AdminProjectTrackingReadyState } from '@/features/admin/projects-tracking/components/AdminProjectTrackingReadyState';
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
    return <AdminProjectTrackingLoadingState message="Cargando seguimiento operativo del proyecto..." />;
  }

  if (error || !project) {
    return (
      <AdminProjectTrackingErrorState
        title="No pudimos cargar el seguimiento del proyecto"
        description={error ?? 'El proyecto no esta disponible en la base operativa.'}
        backLabel="Volver a proyectos"
        onBack={onBack}
        onRetry={() => refresh()}
      />
    );
  }

  const totalTasks = project.rootTasks.length + project.phases.reduce((acc, phase) => acc + phase.tareas.length, 0);
  const visibleOwners = project.phases.filter((phase) => Boolean(phase.responsable)).length;
  const overviewCards = [
    { icon: KanbanSquare, label: 'Fases cargadas', value: project.phases.length, tone: 'text-[var(--signal)]' },
    { icon: ShieldAlert, label: 'Tareas operativas', value: totalTasks, tone: 'text-[var(--warning)]' },
    { icon: UserRound, label: 'Responsables visibles', value: visibleOwners, tone: 'text-[var(--success)]' },
    {
      icon: CalendarClock,
      label: 'Avance declarado',
      value: `${project.completionPercentage}%`,
      tone: 'text-[var(--signal)]',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

      <section id="resumen" className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {overviewCards.map(({ icon: Icon, label, tone, value }) => (
          <div
            key={label}
            className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl"
          >
            <Icon className={`mb-3 h-5 w-5 ${tone}`} />
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </section>

      {project.phases.length === 0 && project.rootTasks.length === 0 ? (
        <AdminProjectTrackingEmptyState onBack={onBack} onEditProject={onEditProject} />
      ) : (
        <AdminProjectTrackingReadyState />
      )}
    </div>
  );
}
