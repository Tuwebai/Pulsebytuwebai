import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectAlertsScreen } from '@/features/admin/projects-tracking/components/AdminProjectAlertsScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectAlertsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <AdminProjectTrackingFrame activeItem="alertas" projectId={projectId}>
      <AdminProjectAlertsScreen
        projectId={projectId}
        onBackToTracking={() => navigate(`/admin/proyectos/${projectId}/seguimiento`)}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
