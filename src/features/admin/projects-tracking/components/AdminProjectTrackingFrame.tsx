import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminProjectTrackingLayout } from '@/features/admin/projects-tracking/components/AdminProjectTrackingLayout';

export type AdminProjectTrackingNavItem = 'resumen' | 'fases' | 'tareas-criticas' | 'alertas';

interface AdminProjectTrackingFrameProps {
  projectId: string | undefined;
  activeItem: AdminProjectTrackingNavItem;
  children: ReactNode;
}

export function AdminProjectTrackingFrame({
  projectId,
  activeItem,
  children,
}: AdminProjectTrackingFrameProps) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminProjectTrackingLayout
      activeItem={activeItem}
      collapsed={sidebarCollapsed}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleCollapse={() => setSidebarCollapsed((currentValue) => !currentValue)}
      onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      onBack={() => navigate('/admin/proyectos')}
      projectId={projectId}
    >
      {children}
    </AdminProjectTrackingLayout>
  );
}
