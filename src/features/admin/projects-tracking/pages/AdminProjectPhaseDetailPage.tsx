import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectPhaseDetailScreen } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectPhaseDetailPage() {
  const navigate = useNavigate();
  const { projectId, phaseId } = useParams<{ projectId: string; phaseId: string }>();

  return (
    <AdminProjectTrackingFrame activeItem="fases" projectId={projectId}>
      <AdminProjectPhaseDetailScreen
        phaseKey={phaseId}
        projectId={projectId}
        onBackToPhases={() => navigate(`/admin/proyectos/${projectId}/seguimiento/fases`)}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
