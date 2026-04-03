import type { ReactNode } from 'react';

import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { AvatarMenu } from '@/core/components';
import { NotificationsBellTrigger } from '@/core/notifications/components/NotificationsBellTrigger';
import { NotificationsPanel } from '@/core/notifications/components/NotificationsPanel';
import { useNotifications } from '@/core/notifications/hooks/useNotifications';
import { useNotificationsPanelState } from '@/core/notifications/hooks/useNotificationsPanelState';
import { AdminSectionNav } from '@/features/admin/components/AdminSectionNav';
import type { AdminSectionId } from '@/features/admin/constants/adminSections';
import AdminSidebar from '@/features/admin/layout/AdminSidebar';
import SupportChatDock from '@/features/support/components/SupportChatDock';

interface AdminShellProps {
  activeSection: AdminSectionId;
  lastUpdate: Date;
  onRefresh: () => void;
  onSectionChange: (sectionId: AdminSectionId) => void;
  children: ReactNode;
}

export function AdminShell({
  activeSection,
  lastUpdate,
  onRefresh,
  onSectionChange,
  children,
}: AdminShellProps) {
  const { logout, user } = useApp();
  const { unreadCount } = useNotifications();
  const { panelOpen, openPanel, closePanel } = useNotificationsPanelState(
    `pulse:admin:${user?.id ?? 'anon'}:notifications-open`,
    user?.id ?? null,
  );

  return (
    <>
      <div
        className="flex h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/90 transition-all duration-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        data-surface="admin"
      >
        <div className="hidden shrink-0 md:block">
          <AdminSidebar />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
              <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-signal via-sky-300/80 to-transparent" />

                <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <AdminSectionNav activeSection={activeSection} onSectionChange={onSectionChange} />
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                        Última actualización operativa: {lastUpdate.toLocaleString()}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onRefresh}
                          className="w-full border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-white/15 hover:bg-[var(--bg-elevated)] sm:w-auto"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Actualizar
                        </Button>

                        <div className="flex items-center justify-end gap-2 rounded-full border border-white/10 bg-[var(--bg-elevated)]/80 p-1">
                          <NotificationsBellTrigger
                            className="h-9 w-9 shrink-0 border border-white/10 bg-[var(--bg-base)]/70 p-0"
                            onClick={openPanel}
                            unreadCount={unreadCount}
                          />
                          <div className="shrink-0">
                            <AvatarMenu onLogout={logout} user={user} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-[calc(100vh-240px)] space-y-3 sm:space-y-4 lg:space-y-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SupportChatDock scope="admin" />
      <NotificationsPanel open={panelOpen} onClose={closePanel} />
    </>
  );
}
