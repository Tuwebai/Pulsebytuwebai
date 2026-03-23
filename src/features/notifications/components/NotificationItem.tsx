import { BarChart2, Bell, FolderOpen, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Notification, NotificationType } from '@/data/types/notifications';
import { cn } from '@/lib/utils';
import { formatNotificationTime } from '../services/notifications.service';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const iconByType: Record<NotificationType, LucideIcon> = {
  new_consultation: MessageSquare,
  monthly_summary: BarChart2,
  project_update: FolderOpen,
  system: Bell
};

const iconColorByType: Record<NotificationType, string> = {
  new_consultation: 'text-[var(--signal)]',
  monthly_summary: 'text-[var(--success)]',
  project_update: 'text-[var(--warning)]',
  system: 'text-[var(--text-secondary)]'
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = iconByType[notification.type];

  return (
    <button
      className={cn(
        'flex w-full items-start gap-3 border-b border-[var(--border-subtle)] px-5 py-3.5 text-left transition-colors duration-200 hover:bg-[var(--bg-elevated)]',
        notification.read ? 'bg-transparent' : 'bg-[color:rgba(59,158,245,0.08)]'
      )}
      type="button"
      onClick={() => onRead(notification.id)}
    >
      <div className="relative mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
        <Icon className={cn('h-4 w-4', iconColorByType[notification.type])} strokeWidth={1.75} />
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full transition-colors',
            notification.read ? 'bg-[var(--text-tertiary)]/40' : 'bg-[var(--signal)]'
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium leading-5 text-[var(--text-primary)]">{notification.title}</p>
          <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>
        {notification.body ? (
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{notification.body}</p>
        ) : null}
      </div>
    </button>
  );
}
