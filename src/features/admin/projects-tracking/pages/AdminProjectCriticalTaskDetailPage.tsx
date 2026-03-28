import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectCriticalTaskDetailScreen } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectCriticalTaskDetailPage() {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();

  return (
    <AdminProjectTrackingFrame activeItem="tareas-criticas" projectId={projectId}>
      <AdminProjectCriticalTaskDetailScreen
        projectId={projectId}
        taskKey={taskId}
        onBackToTasks={() => navigate(`/admin/proyectos/${projectId}/seguimiento/tareas`)}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
