import { useApp } from '@/contexts/AppContext';
import { Bell } from 'lucide-react';
import { NotificationsPanel } from '@/features/notifications/components/NotificationsPanel';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useApp();
  const [panelOpen, setPanelOpen] = useSessionStorageState(
    `pulse:topbar:${user?.id ?? 'anon'}:notifications-open`,
    false
  );
  const { unreadCount } = useNotifications();

  useNotificationsRealtime(user?.id ?? null);

  return (
    <>
      <button
        aria-label="Abrir notificaciones"
        className={`relative rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] ${className}`.trim()}
        type="button"
        onClick={() => setPanelOpen(true)}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
