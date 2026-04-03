import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useApp } from '@/contexts/AppContext';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem';
import { SidebarProfile } from '@/components/sidebar/SidebarProfile';
import { SidebarSection } from '@/components/sidebar/SidebarSection';

export default function AdminSidebar() {
  const { user, logout } = useApp();
  const { t } = useTranslation();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background dark:border-slate-700 dark:bg-slate-900">
      <div className="h-0.5 w-full" style={{ background: 'var(--gradient-brand)' }} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SidebarProfile user={user} isAdmin />

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarSection title={t('Principal')} isAdmin>
            <SidebarNavItem to="/admin" icon={<BarChart3 size={18} />} label="Pulse Admin" isAdmin />
          </SidebarSection>
        </nav>
      </div>

      <SidebarFooter isAdmin onLogout={logout} />
    </aside>
  );
}
