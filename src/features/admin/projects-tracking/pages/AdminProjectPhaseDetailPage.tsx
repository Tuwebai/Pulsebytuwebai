import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AdminProjectPhaseDetailScreen } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDetailScreen';
import { AdminProjectTrackingFrame } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';

export default function AdminProjectPhaseDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId, phaseId } = useParams<{ projectId: string; phaseId: string }>();
  const fromAlerts = searchParams.get('from') === 'alertas';
  const startInEditMode = searchParams.get('edit') === '1';
  const backTo = fromAlerts
    ? `/admin/proyectos/${projectId}/seguimiento/alertas`
    : `/admin/proyectos/${projectId}/seguimiento/fases`;

  return (
    <AdminProjectTrackingFrame activeItem={fromAlerts ? 'alertas' : 'fases'} projectId={projectId}>
      <AdminProjectPhaseDetailScreen
        phaseKey={phaseId}
        projectId={projectId}
        backLabel={fromAlerts ? 'Volver a alertas' : 'Volver a fases'}
        startInEditMode={startInEditMode}
        onBackToPhases={() => navigate(backTo)}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingFrame>
  );
}
