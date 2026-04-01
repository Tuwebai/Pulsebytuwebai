import React from 'react';
import { BarChart3, CreditCard, FolderKanban, HelpCircle, Home, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useApp } from '@/contexts/AppContext';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem';
import { SidebarProfile } from '@/components/sidebar/SidebarProfile';
import { SidebarSection } from '@/components/sidebar/SidebarSection';

export default function Sidebar() {
  const { user, logout } = useApp();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  return (
    <aside
      className={`flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background dark:border-slate-700 dark:bg-slate-900 ${
        isAdmin ? 'shadow-none' : 'shadow-xl'
      }`}
    >
      <div className="h-0.5 w-full" style={{ background: 'var(--gradient-brand)' }} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SidebarProfile user={user} isAdmin={isAdmin} />

        {isAdmin ? (
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarSection title={t('Principal')} isAdmin>
              <SidebarNavItem to="/admin" icon={<BarChart3 size={18} />} label="Pulse Admin" isAdmin />
            </SidebarSection>
          </nav>
        ) : (
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            <SidebarSection title="Principal">
              <SidebarNavItem to="/dashboard" icon={<Home size={18} />} label={t('Dashboard')} isAdmin={false} />
              <SidebarNavItem to="/proyectos" icon={<FolderKanban size={18} />} label={t('Proyectos')} isAdmin={false} />
            </SidebarSection>

            <SidebarSection title="Personal">
              <SidebarNavItem to="/perfil" icon={<User size={18} />} label={t('Mi Perfil')} isAdmin={false} />
              <SidebarNavItem to="/facturacion" icon={<CreditCard size={18} />} label="Facturación" isAdmin={false} />
            </SidebarSection>

            <SidebarSection title="Soporte">
              <SidebarNavItem to="/soporte" icon={<HelpCircle size={18} />} label={t('Soporte')} isAdmin={false} />
              <SidebarNavItem to="/configuracion" icon={<Settings size={18} />} label="Configuración" isAdmin={false} />
            </SidebarSection>
          </nav>
        )}
      </div>

      <SidebarFooter isAdmin={isAdmin} onLogout={logout} />
    </aside>
  );
}
