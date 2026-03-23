export type NotificationType = 'new_consultation' | 'monthly_summary' | 'project_update' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferences {
  notif_new_consultation: boolean;
  notif_monthly_summary: boolean;
  notif_project_update: boolean;
}

export interface GroupedNotifications {
  today: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}
