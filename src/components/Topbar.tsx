import { useLocation } from 'react-router-dom';

import { TopbarActions } from '@/components/topbar/TopbarActions';
import { TopbarHeaderContent } from '@/components/topbar/TopbarHeaderContent';
import { TopbarProps } from '@/components/topbar/topbar.types';
import { TopbarUserMenu } from '@/components/topbar/TopbarUserMenu';
import { useTopbarGreeting } from '@/components/topbar/useTopbarGreeting';

export default function Topbar({
  onMenuClick,
  showMobileMenu = false,
  onRefreshData,
  clientDashboardStats,
  onClientRefresh,
  onClientSearch,
  clientSearchTerm = '',
}: TopbarProps) {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const isClientPulseRoute =
    location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  const isClientDashboardHome = location.pathname === '/dashboard';
  const { aiLoading, greeting } = useTopbarGreeting({
    isAdminPage,
    isClientPulseRoute,
  });

  const title = aiLoading ? 'Websy AI pensando...' : greeting;

  return (
    <header
      className={`${isAdminPage || isClientPulseRoute ? 'h-auto' : 'h-16'} border-b border-border bg-background shadow-sm`}
    >
      <div
        className={`flex items-center justify-between px-6 ${isAdminPage || isClientPulseRoute ? 'py-6' : 'h-full'}`}
      >
        <TopbarHeaderContent
          greeting={title}
          isAdminPage={isAdminPage}
          isClientPulseRoute={isClientPulseRoute}
          onMenuClick={onMenuClick}
          onSearchChange={undefined}
          searchTerm=""
          showMobileMenu={showMobileMenu}
        />

        <div className="flex items-center gap-6">
          <TopbarActions
            clientProjectCount={clientDashboardStats?.totalProjects ?? 0}
            isAdminPage={isAdminPage}
            isClientDashboardHome={isClientDashboardHome}
            isClientPulseRoute={isClientPulseRoute}
            onClientRefresh={onClientRefresh}
            onClientSearch={onClientSearch}
            onRefreshData={onRefreshData}
            searchTerm={clientSearchTerm}
          />
          <TopbarUserMenu />
        </div>
      </div>
    </header>
  );
}
