import { useApp } from '@/contexts/AppContext';
import { NotificationsBellTrigger } from '@/core/notifications/components/NotificationsBellTrigger';
import { NotificationsPanel } from '@/core/notifications/components/NotificationsPanel';
import { useNotifications } from '@/core/notifications/hooks/useNotifications';
import { useNotificationsPanelState } from '@/core/notifications/hooks/useNotificationsPanelState';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useApp();
  const { panelOpen, openPanel, closePanel } = useNotificationsPanelState(
    `pulse:topbar:${user?.id ?? 'anon'}:notifications-open`,
    user?.id ?? null
  );
  const { unreadCount } = useNotifications();

  return (
    <>
      <NotificationsBellTrigger className={className} onClick={openPanel} unreadCount={unreadCount} />

      <NotificationsPanel open={panelOpen} onClose={closePanel} />
    </>
  );
}
