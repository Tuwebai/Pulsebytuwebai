import { AvatarMenu, PulseLogo } from '@/core/components';
import { NotificationsBellTrigger } from '@/core/notifications/components/NotificationsBellTrigger';
import { useApp } from '@/contexts/AppContext';
import { NotificationsPanel } from '@/core/notifications/components/NotificationsPanel';
import { useNotifications } from '@/core/notifications/hooks/useNotifications';
import { useNotificationsPanelState } from '@/core/notifications/hooks/useNotificationsPanelState';
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
      <header
        className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 md:px-8"
        data-tour="shell-header"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <PulseLogo size={24} variant="night" />
            <span className="text-sm font-medium tracking-[0.24em] text-[var(--text-primary)]">PULSE</span>
          </div>

          <div>
            <p className="text-[15px] font-normal text-[var(--text-primary)]">
              {greeting}, {profile?.full_name || user?.full_name || 'cliente'}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">{dateLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsBellTrigger dataTour="shell-notifications" onClick={openPanel} unreadCount={unreadCount} />
          <HelpButton variant="minimal" />

          <div data-tour="shell-avatar-menu">
            <AvatarMenu onLogout={logout} user={user} />
          </div>
        </div>
      </header>

      <NotificationsPanel open={panelOpen} onClose={closePanel} />
    </>
  );
}
