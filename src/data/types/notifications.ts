export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'critical';

export type NotificationCategory = 'system' | 'project' | 'ticket' | 'payment' | 'security' | 'user';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string | null;
  is_read: boolean;
  is_urgent: boolean;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export interface NotificationPreferences {
  notif_new_consultation: boolean;
  notif_monthly_summary: boolean;
  notif_project_update: boolean;
}

export interface PushSubscriptionStatus {
  endpoint: string | null;
  isSubscribed: boolean;
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
}

export interface GroupedNotifications {
  today: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}
