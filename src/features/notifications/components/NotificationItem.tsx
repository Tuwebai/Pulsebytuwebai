import { BarChart2, Bell, CheckCircle, MessageSquare, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Notification, NotificationType } from '@/data/types/notifications';
import { cn } from '@/lib/utils';
import { formatNotificationTime } from '../services/notifications.service';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const notificationIconMap: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  admin: { icon: MessageSquare, color: '#3B9EF5' },
  project_message: { icon: MessageSquare, color: '#3B9EF5' },
  project_approved: { icon: CheckCircle, color: '#22C55E' },
  project_rejected: { icon: XCircle, color: '#EF4444' },
  new_consultation: { icon: Bell, color: '#F59E0B' },
  monthly_summary: { icon: BarChart2, color: '#22C55E' },
  system: { icon: Bell, color: '#8B9AC0' }
};

function getNotificationIcon(notification: Notification): { icon: LucideIcon; color: string } {
  const mappedIcon = notificationIconMap[notification.type as NotificationType];

  if (mappedIcon) {
    return mappedIcon;
  }

  const title = notification.title.toLowerCase();
  const body = notification.body?.toLowerCase() ?? '';
  const content = `${title} ${body}`;

  if (content.includes('mensaje del admin')) {
    return notificationIconMap.admin;
  }

  if (content.includes('mensaje en proyecto') || content.includes('ha enviado un mensaje en el proyecto')) {
    return notificationIconMap.project_message;
  }

  if (content.includes('aprobado')) {
    return notificationIconMap.project_approved;
  }

  if (content.includes('rechaz')) {
    return notificationIconMap.project_rejected;
  }

  if (content.includes('consulta')) {
    return notificationIconMap.new_consultation;
  }

  if (content.includes('resumen')) {
    return notificationIconMap.monthly_summary;
  }

  return notificationIconMap.system;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { icon: Icon, color } = getNotificationIcon(notification);

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
        <Icon className="h-[18px] w-[18px]" color={color} strokeWidth={1.5} />
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
