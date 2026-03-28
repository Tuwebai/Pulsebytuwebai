import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectCriticalTasksScreen } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTasksScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectCriticalTasksPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <AdminProjectTrackingFrame activeItem="tareas-criticas" projectId={projectId}>
      <AdminProjectCriticalTasksScreen
        projectId={projectId}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
