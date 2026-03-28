import type { ReactNode } from 'react';

import { RefreshCw, Shield } from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { AvatarMenu } from '@/core/components';
import { NotificationsBellTrigger } from '@/core/notifications/components/NotificationsBellTrigger';
import { NotificationsPanel } from '@/core/notifications/components/NotificationsPanel';
import { useNotifications } from '@/core/notifications/hooks/useNotifications';
import { useNotificationsPanelState } from '@/core/notifications/hooks/useNotificationsPanelState';
import { AdminSectionNav } from '@/features/admin/components/AdminSectionNav';
import { getAdminSectionLabel, type AdminSectionId } from '@/features/admin/constants/adminSections';

interface AdminShellProps {
  activeSection: AdminSectionId;
  lastUpdate: Date;
  onRefresh: () => void;
  onSectionChange: (sectionId: AdminSectionId) => void;
  children: ReactNode;
}

const ADMIN_SECTION_SUMMARIES: Record<AdminSectionId, string> = {
  dashboard: 'Lectura diaria de clientes, soporte, proyectos y cobranza.',
  usuarios: 'Accesos, dominios y estado operativo de cada cliente.',
  proyectos: 'Seguimiento operativo de entregas, bloqueos y avance.',
  'aprobar-proyectos': 'Aprobaciones pendientes y decisiones de publicación.',
  tickets: 'Casos abiertos, urgencias y seguimiento de soporte.',
  pagos: 'Cobranza, estado administrativo y movimientos clave.',
  notifications: 'Eventos operativos y alertas internas de Pulse.',
  settings: 'Ajustes internos del panel y configuración operativa.',
};

export function AdminShell({
  activeSection,
  lastUpdate,
  onRefresh,
  onSectionChange,
  children,
}: AdminShellProps) {
  const { logout, user } = useApp();
  const sectionLabel = getAdminSectionLabel(activeSection);
  const sectionSummary = ADMIN_SECTION_SUMMARIES[activeSection];
  const { unreadCount } = useNotifications();
  const { panelOpen, openPanel, closePanel } = useNotificationsPanelState(
    `pulse:admin:${user?.id ?? 'anon'}:notifications-open`,
    user?.id ?? null,
  );

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/90 transition-all duration-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-signal via-sky-300/80 to-transparent" />

            <div className="flex flex-col gap-5 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-signal/20 bg-signal/15 text-signal hover:bg-signal/15">
                      <Shield className="mr-1 h-3.5 w-3.5" />
                      Pulse Admin
                    </Badge>
                    <Badge className="border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.06]">
                      {sectionLabel}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                      Operación Pulse
                    </p>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                      {sectionLabel}
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                      {sectionSummary}
                    </p>
                  </div>
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
                      <ThemeToggle size="sm" variant="ghost" className="shrink-0" />
                      <NotificationsBellTrigger
                        className="h-9 w-9 shrink-0 border border-white/10 bg-[var(--bg-base)]/70 p-0"
                        onClick={openPanel}
                        unreadCount={unreadCount}
                      />
                      <div className="shrink-0">
                        <AvatarMenu onLogout={logout} onOpenNotifications={openPanel} user={user} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <AdminSectionNav activeSection={activeSection} onSectionChange={onSectionChange} />
              </div>
            </div>
          </div>

          <div className="min-h-[calc(100vh-240px)] space-y-3 sm:space-y-4 lg:space-y-6">
            {children}
          </div>
        </div>
      </div>
      <NotificationsPanel open={panelOpen} onClose={closePanel} />
    </>
  );
}
