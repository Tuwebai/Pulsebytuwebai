import { AlertTriangle, BarChart2, Bell, CheckCircle, MessageSquare, ShieldAlert, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Notification } from '@/data/types/notifications';
import { cn } from '@/lib/utils';
import { formatNotificationTime } from '../services/notifications.service';

interface NotificationItemProps {
  notification: Notification;
  onSelect: (notification: Notification) => void;
}

type NotificationVisual = {
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
  borderColor: string;
};

type NotificationDisplayType =
  | 'project_message'
  | 'project_approved'
  | 'project_rejected'
  | 'new_consultation'
  | 'monthly_summary'
  | 'security'
  | 'system';

const baseNotificationIconMap: Record<NotificationDisplayType, { icon: LucideIcon; color: string }> = {
  project_message: { icon: MessageSquare, color: '#3B9EF5' },
  project_approved: { icon: CheckCircle, color: '#22C55E' },
  project_rejected: { icon: XCircle, color: '#EF4444' },
  new_consultation: { icon: Bell, color: '#F59E0B' },
  monthly_summary: { icon: BarChart2, color: '#22C55E' },
  security: { icon: ShieldAlert, color: '#EF4444' },
  system: { icon: AlertTriangle, color: '#8B9AC0' }
};

const notificationIconMap = Object.fromEntries(
  Object.entries(baseNotificationIconMap).map(([type, value]) => [
    type,
    {
      ...value,
      backgroundColor: hexToRgba(value.color, 0.16),
      borderColor: hexToRgba(value.color, 0.28)
    }
  ])
) as Record<NotificationDisplayType, NotificationVisual>;

function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.replace('#', '');
  const r = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const g = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const b = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDisplayType(notification: Notification): NotificationDisplayType {
  const title = notification.title.toLowerCase();
  const message = notification.message?.toLowerCase() ?? '';
  const content = `${title} ${message}`;

  if (content.includes('mensaje en proyecto') || content.includes('ha enviado un mensaje en el proyecto')) {
    return 'project_message';
  }

  if (content.includes('aprobado')) {
    return 'project_approved';
  }

  if (content.includes('rechaz')) {
    return 'project_rejected';
  }

  if (content.includes('consulta')) {
    return 'new_consultation';
  }

  if (content.includes('resumen')) {
    return 'monthly_summary';
  }

  if (notification.category === 'security' || notification.type === 'critical' || notification.type === 'error') {
    return 'security';
  }

  if (notification.category === 'project') {
    return 'project_message';
  }

  return 'system';
}

function getNotificationIcon(notification: Notification): NotificationVisual {
  return notificationIconMap[getDisplayType(notification)];
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const { icon: Icon, color, backgroundColor, borderColor } = getNotificationIcon(notification);

  return (
    <button
      className={cn(
        'flex w-full items-start gap-3 border-b border-[var(--border-subtle)] px-5 py-3.5 text-left transition-colors duration-200 hover:bg-[var(--bg-elevated)]',
        notification.is_read ? 'bg-transparent' : 'bg-[color:rgba(59,158,245,0.08)]'
      )}
      type="button"
      onClick={() => onSelect(notification)}
    >
      <div
        className="relative mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border"
        style={{ backgroundColor, borderColor, boxShadow: `0 0 0 1px ${hexToRgba(color, 0.08)} inset` }}
      >
        <Icon className="h-[18px] w-[18px]" color={color} strokeWidth={1.5} />
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full transition-colors',
            notification.is_read ? 'bg-[var(--text-tertiary)]/40' : 'bg-[var(--signal)]'
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
        {notification.message ? (
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{notification.message}</p>
        ) : null}
      </div>
    </button>
  );
}
