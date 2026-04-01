import { AvatarMenu, PulseLogo } from '@/core/components';
import { NotificationsBellTrigger } from '@/core/notifications/components/NotificationsBellTrigger';
import { NotificationsPanel } from '@/core/notifications/components/NotificationsPanel';
import { useNotifications } from '@/core/notifications/hooks/useNotifications';
import { useNotificationsPanelState } from '@/core/notifications/hooks/useNotificationsPanelState';
import { useApp } from '@/contexts/AppContext';
import HelpButton from '@/features/help/components/HelpButton';
import { useProfile } from '@/features/profile/hooks/useProfile';

function getGreeting(date = new Date()) {
  const hours = date.getHours();

  if (hours < 12) {
    return 'Buenos días';
  }

  if (hours < 20) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export default function Header() {
  const { logout, user } = useApp();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const { panelOpen, openPanel, closePanel } = useNotificationsPanelState(
    `pulse:header:${user?.id ?? 'anon'}:notifications-open`,
    user?.id ?? null,
  );
  const greeting = getGreeting();
  const dateLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <>
      <header className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-8 lg:pt-6" data-tour="shell-header">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-signal via-sky-300/80 to-transparent" />

            <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex items-center gap-2 md:hidden">
                    <PulseLogo size={24} variant="night" />
                    <span className="text-sm font-medium tracking-[0.24em] text-[var(--text-primary)]">PULSE</span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-normal text-[var(--text-primary)]">
                      {greeting}, {profile?.full_name || user?.full_name || 'cliente'}
                    </p>
                    <p className="truncate text-[12px] text-[var(--text-tertiary)]">{dateLabel}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                    Seguimiento Pulse en vivo
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center justify-end gap-2 rounded-full border border-white/10 bg-[var(--bg-elevated)]/80 p-1">
                      <NotificationsBellTrigger
                        className="h-9 w-9 shrink-0 border border-white/10 bg-[var(--bg-base)]/70 p-0"
                        dataTour="shell-notifications"
                        onClick={openPanel}
                        unreadCount={unreadCount}
                      />
                      <HelpButton variant="minimal" />
                      <div data-tour="shell-avatar-menu">
                        <AvatarMenu onLogout={logout} user={user} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel open={panelOpen} onClose={closePanel} />
    </>
  );
}
