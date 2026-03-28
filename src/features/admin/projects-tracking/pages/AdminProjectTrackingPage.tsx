import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminProjectTrackingLayout } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLayout';
import { AdminProjectTrackingScreen } from '@/features/admin/projects-tracking/components/AdminProjectTrackingScreen';

export default function AdminProjectTrackingPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const refreshSignal = 0;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleBack = () => {
    navigate('/admin/proyectos');
  };

  return (
    <AdminProjectTrackingLayout
      collapsed={sidebarCollapsed}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleCollapse={() => setSidebarCollapsed((currentValue) => !currentValue)}
      onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      onBack={handleBack}
    >
      <AdminProjectTrackingScreen
        projectId={projectId}
        refreshSignal={refreshSignal}
        onBack={handleBack}
        onEditProject={() => {
          navigate('/admin/proyectos', { state: { editProjectId: projectId } });
        }}
      />
    </AdminProjectTrackingLayout>
  );
}
