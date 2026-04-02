import { BellRing, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/core/notifications/hooks/usePushNotifications';
import { NotificationPreferenceToggle } from './NotificationPreferenceToggle';

function getPushDescription(permission: NotificationPermission | 'unsupported', isSubscribed: boolean) {
  if (permission === 'unsupported') {
    return 'Este navegador no soporta notificaciones push web.';
  }

  if (permission === 'denied') {
    return 'Este navegador bloqueó las notificaciones. Podés habilitarlas desde la configuración del sitio.';
  }

  if (isSubscribed) {
    return 'Este dispositivo ya recibe avisos en tiempo real cuando haya novedades importantes.';
  }

  return 'Activá avisos en este dispositivo para enterarte al instante de tickets, pagos y novedades.';
}

export function NotificationPushSubscriptionCard() {
  const { enablePush, disablePush, isLoading, isSaving, status } = usePushNotifications();
  const checked = status?.isSubscribed ?? false;
  const disabled = isLoading || isSaving || status?.permission === 'unsupported';

  const handleChange = async (next: boolean) => {
    try {
      if (next) {
        await enablePush();
        toast({ title: 'Push activado', description: 'Este dispositivo ya puede recibir avisos de Pulse.' });
        return;
      }

      await disablePush();
      toast({ title: 'Push desactivado', description: 'Este dispositivo dejó de recibir avisos push.' });
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'PUSH_PERMISSION_DENIED'
          ? 'Necesitás permitir notificaciones en el navegador para activar los avisos push.'
          : 'No pudimos actualizar las notificaciones push en este dispositivo.';

      toast({ title: 'No se pudo guardar', description: message, variant: 'destructive' });
    }
  };

  return (
    <NotificationPreferenceToggle
      checked={checked}
      description={getPushDescription(status?.permission ?? 'unsupported', checked)}
      disabled={disabled}
      icon={
        <div className="flex items-center gap-1">
          <BellRing className="h-4 w-4" strokeWidth={1.75} />
          <Smartphone className="h-4 w-4" strokeWidth={1.75} />
        </div>
      }
      title="Notificaciones push en este dispositivo"
      onChange={(next) => {
        void handleChange(next);
      }}
    />
  );
}
