import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useApp } from '@/contexts/useApp';
import { AdminSidebarFooter } from '@/features/admin/layout/AdminSidebarFooter';
import { AdminSidebarNavItem } from '@/features/admin/layout/AdminSidebarNavItem';
import { AdminSidebarProfile } from '@/features/admin/layout/AdminSidebarProfile';
import { AdminSidebarSection } from '@/features/admin/layout/AdminSidebarSection';

export default function AdminSidebar() {
  const { user } = useApp();
  const { t } = useTranslation();

  return (
    <aside className="flex h-[100dvh] min-h-[100dvh] w-64 flex-col border-r border-sidebar-border bg-sidebar-background dark:border-slate-700 dark:bg-slate-900">
      <div className="h-0.5 w-full" style={{ background: 'var(--gradient-brand)' }} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AdminSidebarProfile user={user} />

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <AdminSidebarSection title={t('Principal')}>
            <AdminSidebarNavItem to="/admin" icon={<BarChart3 size={18} />} label="Pulse Admin" />
          </AdminSidebarSection>
        </nav>
      </div>

      <AdminSidebarFooter />
    </aside>
  );
}
