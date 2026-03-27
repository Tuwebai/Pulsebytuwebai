import React from 'react';
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAvatarSync } from '@/hooks/useAvatarSync';
import SkipLink from './SkipLink';
import LiveRegion from './LiveRegion';
import { useAccessibility } from '@/hooks/useAccessibility';
import { userPreferencesService } from '@/lib/userPreferencesService';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { FloatingHelpButton } from './tutorial/ContextualHelp';

interface DashboardLayoutProps {
  children: React.ReactNode;
  dashboardProps?: {
    searchTerm?: string;
    onSearch?: (term: string) => void;
    stats?: {
      totalProjects: number;
      totalComments: number;
      inProgressProjects: number;
      completedProjects: number;
    };
    onRefresh?: () => void;
  };
}

const WIDGETS = [
  { key: 'projects', label: 'Proyectos' },
  { key: 'stats', label: 'Estadisticas' },
  { key: 'team', label: 'Equipo' },
  { key: 'help', label: 'Ayuda' }
];

export default function DashboardLayout({ children, dashboardProps }: DashboardLayoutProps) {
  const { isAuthenticated, authReady, user } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : WIDGETS.map((widget) => widget.key);
  });
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);
  const location = useLocation();

  const { announceToScreenReader } = useAccessibility({
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    enableFocusManagement: true
  });

  const routeKey = location.pathname.replace(/\//g, '-').substring(1) || 'root';

  useAvatarSync();

  useEffect(() => {
    const loadUserWidgets = async () => {
      if (isAuthenticated && user && !widgetsLoaded) {
        try {
          const userWidgets = await userPreferencesService.getDashboardWidgets(user.id);
          if (userWidgets.length > 0) {
            setVisibleWidgets(userWidgets);
          }
          setWidgetsLoaded(true);
        } catch (error) {
          console.error('Error loading user widgets:', error);
          setWidgetsLoaded(true);
        }
      } else if (!isAuthenticated) {
        setWidgetsLoaded(true);
      }
    };

    void loadUserWidgets();
  }, [isAuthenticated, user, widgetsLoaded]);

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(visibleWidgets));

    if (isAuthenticated && user && widgetsLoaded) {
      userPreferencesService.saveDashboardWidgets(user.id, visibleWidgets).catch((error) => {
        console.error('Error saving user widgets:', error);
      });
    }
  }, [visibleWidgets, isAuthenticated, user, widgetsLoaded]);

  useEffect(() => {
    const pageTitle = document.title || 'Pulse by TuWebAI';
    announceToScreenReader(`Navegando a ${pageTitle}`, 'polite');
  }, [location.pathname, announceToScreenReader]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdminPage = location.pathname === '/admin';
  const isClientDashboardPage = location.pathname === '/dashboard';

  return (
    <>
      <SkipLink targetId="main-content" />

      <LiveRegion
        message=""
        priority="polite"
        autoClear={true}
        clearDelay={3000}
      />

      <div key={routeKey} className="h-screen w-full bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {isMobileMenuOpen ? (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Cerrar menu movil"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setIsMobileMenuOpen(false);
                }
              }}
            />
            <div className="relative">
              <Sidebar />
            </div>
          </div>
        ) : null}

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {!isAdminPage ? (
            <Topbar
              onMenuClick={() => setIsMobileMenuOpen(true)}
              showMobileMenu={true}
              onRefreshData={undefined}
              lastUpdate={isClientDashboardPage ? new Date() : undefined}
              isAdmin={false}
              isClientDashboard={isClientDashboardPage}
              clientDashboardStats={
                isClientDashboardPage && dashboardProps?.stats ? dashboardProps.stats : undefined
              }
              onClientRefresh={
                isClientDashboardPage && dashboardProps?.onRefresh
                  ? dashboardProps.onRefresh
                  : undefined
              }
              onClientSearch={
                isClientDashboardPage && dashboardProps?.onSearch ? dashboardProps.onSearch : undefined
              }
              clientSearchTerm={
                isClientDashboardPage && dashboardProps?.searchTerm ? dashboardProps.searchTerm : ''
              }
            />
          ) : null}
          <main id="main-content" className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>

        <TutorialOverlay />
        <FloatingHelpButton />
      </div>
    </>
  );
}
