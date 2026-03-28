import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AdminProjectCriticalTaskDetailScreen } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectCriticalTaskDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const fromAlerts = searchParams.get('from') === 'alertas';
  const startInEditMode = searchParams.get('edit') === '1';
  const backTo = fromAlerts
    ? `/admin/proyectos/${projectId}/seguimiento/alertas`
    : `/admin/proyectos/${projectId}/seguimiento/tareas`;

  return (
    <AdminProjectTrackingFrame activeItem={fromAlerts ? 'alertas' : 'tareas-criticas'} projectId={projectId}>
      <AdminProjectCriticalTaskDetailScreen
        projectId={projectId}
        taskKey={taskId}
        backLabel={fromAlerts ? 'Volver a alertas' : 'Volver a tareas críticas'}
        startInEditMode={startInEditMode}
        onBackToTasks={() => navigate(backTo)}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
