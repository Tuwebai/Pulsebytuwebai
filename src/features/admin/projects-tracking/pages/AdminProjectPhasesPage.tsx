import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectPhasesScreen } from '@/features/admin/projects-tracking/components/AdminProjectPhasesScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectPhasesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <AdminProjectTrackingFrame activeItem="fases" projectId={projectId}>
      <AdminProjectPhasesScreen
        projectId={projectId}
        onBack={() => navigate('/admin/proyectos')}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
