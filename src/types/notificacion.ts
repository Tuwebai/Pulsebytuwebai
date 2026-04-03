// Tipos de notificación compartidos del dominio Pulse.

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: 'system' | 'project' | 'ticket' | 'payment' | 'security' | 'user';
  is_read: boolean;
  is_urgent: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  ticket_updates: boolean;
  payment_updates: boolean;
  security_alerts: boolean;
  system_notifications: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  is_urgent?: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
}

export interface UpdateNotificationData {
  is_read?: boolean;
  is_urgent?: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  is_read?: boolean;
  is_urgent?: boolean;
  limit?: number;
  offset?: number;
  currentUserId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export default Notification;
