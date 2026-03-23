import { Bell } from 'lucide-react';
import { AvatarMenu, PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { NotificationsPanel } from '@/features/notifications/components/NotificationsPanel';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';

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
  const [panelOpen, setPanelOpen] = useSessionStorageState(`pulse:header:${user?.id ?? 'anon'}:notifications-open`, false);
  const { unreadCount } = useNotifications();
  useNotificationsRealtime(user?.id || null);
  const greeting = getGreeting();
  const dateLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <PulseLogo size={24} variant="night" />
            <span className="text-sm font-medium tracking-[0.24em] text-[var(--text-primary)]">PULSE</span>
          </div>

          <div>
            <p className="text-[15px] font-normal text-[var(--text-primary)]">
              {greeting}, {user?.full_name || 'cliente'}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">{dateLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir notificaciones"
            className="relative rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            type="button"
            onClick={() => setPanelOpen(true)}
          >
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          <AvatarMenu onLogout={logout} onOpenNotifications={() => setPanelOpen(true)} user={user} />
        </div>
      </header>

      <NotificationsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
