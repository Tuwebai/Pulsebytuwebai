import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectTrackingScreen } from '@/features/admin/projects-tracking/components/AdminProjectTrackingScreen';
import { AdminShell } from '@/features/admin/layout/AdminShell';

function navigateToAdminSection(navigate: ReturnType<typeof useNavigate>, sectionId: string) {
  const nextPath = sectionId === 'dashboard' ? '/admin' : `/admin/${sectionId}`;
  navigate(nextPath);
}

export default function AdminProjectTrackingPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [lastUpdate, setLastUpdate] = useState(() => new Date());
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <AdminShell
      activeSection="proyectos"
      lastUpdate={lastUpdate}
      onRefresh={() => {
        setRefreshSignal((currentValue) => currentValue + 1);
        setLastUpdate(new Date());
      }}
      onSectionChange={(sectionId) => navigateToAdminSection(navigate, sectionId)}
    >
      <AdminProjectTrackingScreen
        projectId={projectId}
        refreshSignal={refreshSignal}
        onBack={() => {
          navigate('/admin/proyectos');
        }}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminShell>
  );
}
