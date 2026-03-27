import { Bell } from 'lucide-react';

interface NotificationsBellTriggerProps {
  className?: string;
  dataTour?: string;
  onClick: () => void;
  unreadCount: number;
}

export function NotificationsBellTrigger({
  className = '',
  dataTour,
  onClick,
  unreadCount
}: NotificationsBellTriggerProps) {
  return (
    <button
      aria-label="Abrir notificaciones"
      className={`relative rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] ${className}`.trim()}
      data-tour={dataTour}
      type="button"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" strokeWidth={1.5} />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-medium text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
