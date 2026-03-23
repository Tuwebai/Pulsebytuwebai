import { supabase } from '../supabase';
import { handleSupabaseError } from './errorHandler';

interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  image?: string;
  timestamp?: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: PushNotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  types: string[];
  settings: {
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    priority: 'low' | 'normal' | 'high';
  };
}

export interface UserNotificationSettings {
  userId: string;
  channels: Record<string, boolean>;
  globalEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: 'immediate' | 'digest' | 'disabled';
}

export class PushNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  constructor() {
    this.initializeServiceWorker();
  }

  // Inicializar Service Worker
  private async initializeServiceWorker(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Solicitar permisos de notificaciÃ³n
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Verificar si las notificaciones estÃ¡n habilitadas
  isNotificationEnabled(): boolean {
    return this.isSupported && Notification.permission === 'granted';
  }

  // Suscribirse a push notifications
  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.serviceWorkerRegistration) {
      return null;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ) as unknown as BufferSource
      });

      // Guardar suscripciÃ³n en la base de datos
      await this.saveSubscription(userId, subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  // Desuscribirse de push notifications
  async unsubscribeFromPush(userId: string): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscription(userId, subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Enviar notificaciÃ³n local
  async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isNotificationEnabled()) {
      return;
    }

    try {
      const notificationOptions: ExtendedNotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        image: payload.image,
        data: payload.data,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        tag: payload.tag,
        timestamp: payload.timestamp || Date.now()
      };

      const notification = new Notification(payload.title, notificationOptions);

      // Manejar clic en notificaciÃ³n
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        const targetUrl = typeof payload.data?.url === 'string' ? payload.data.url : null;

        if (targetUrl) {
          window.location.href = targetUrl;
        }
        
        notification.close();
      };

      // Auto-cerrar despuÃ©s de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Enviar notificaciÃ³n push
  async sendPushNotification(
    userId: string, 
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          payload
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Enviar notificaciÃ³n push');
      return false;
    }
  }

  // Obtener configuraciÃ³n de notificaciones del usuario
  async getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Obtener configuraciÃ³n de notificaciones');
      return null;
    }
  }

  // Actualizar configuraciÃ³n de notificaciones
  async updateUserNotificationSettings(
    userId: string, 
    settings: Partial<UserNotificationSettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Actualizar configuraciÃ³n de notificaciones');
      return false;
    }
  }

  // Obtener canales de notificaciÃ³n disponibles
  async getNotificationChannels(): Promise<NotificationChannel[]> {
    try {
      const { data, error } = await supabase
        .from('notification_channels')
        .select('*')
        .eq('enabled', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'Obtener canales de notificaciÃ³n');
      return [];
    }
  }

  // Crear canal de notificaciÃ³n
  async createNotificationChannel(channel: Omit<NotificationChannel, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .insert([channel]);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Crear canal de notificaciÃ³n');
      return false;
    }
  }

  // Enviar notificaciÃ³n a canal especÃ­fico
  async sendNotificationToChannel(
    channelId: string,
    payload: PushNotificationPayload,
    targetUsers?: string[]
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-channel-notification', {
        body: {
          channelId,
          payload,
          targetUsers
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Enviar notificaciÃ³n a canal');
      return false;
    }
  }

  // Programar notificaciÃ³n
  async scheduleNotification(
    userId: string,
    payload: PushNotificationPayload,
    scheduledTime: Date
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .insert([{
          user_id: userId,
          payload,
          scheduled_time: scheduledTime.toISOString(),
          status: 'pending'
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Programar notificaciÃ³n');
      return false;
    }
  }

  // Obtener notificaciones programadas
  async getScheduledNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('scheduled_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'Obtener notificaciones programadas');
      return [];
    }
  }

  // Cancelar notificaciÃ³n programada
  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled' })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Cancelar notificaciÃ³n programada');
      return false;
    }
  }

  // Verificar si estÃ¡ en horas silenciosas
  isInQuietHours(settings: UserNotificationSettings): boolean {
    if (!settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: settings.quietHours.timezone 
    });
    
    const start = settings.quietHours.start;
    const end = settings.quietHours.end;

    // Si el rango cruza medianoche
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  // Guardar suscripciÃ³n en la base de datos
  private async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'Guardar suscripciÃ³n push');
    }
  }

  // Eliminar suscripciÃ³n de la base de datos
  private async removeSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('subscription->>endpoint', subscription.endpoint);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'Eliminar suscripciÃ³n push');
    }
  }

  // Convertir clave VAPID a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = new PushNotificationService();
