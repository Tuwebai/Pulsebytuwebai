import { BellRing, Smartphone } from 'lucide-react';
import { toast } from '@/core/notifications/hooks/useToast';
import { usePushNotifications } from '@/core/notifications/hooks/usePushNotifications';
import { requestPushPermission } from '@/core/notifications/services/pushNotifications.service';
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

  return 'Al activarlo, el navegador te va a pedir permiso para avisarte al instante de tickets, pagos y novedades.';
}

function resolvePushErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'No pudimos actualizar las notificaciones push en este dispositivo.';
  }

  switch (error.message) {
    case 'PUSH_PERMISSION_DENIED':
      return 'Necesitas permitir notificaciones en el navegador para activar los avisos push.';
    case 'PUSH_SERVICE_WORKER_FAILED':
      return 'No pudimos preparar el navegador para recibir notificaciones. Recargá la página e intentá otra vez.';
    case 'PUSH_CONFIG_MISSING':
      return 'Falta la configuracion publica de push en este entorno.';
    case 'PUSH_KEYS_MISSING':
      return 'El navegador no devolvió las credenciales necesarias para registrar este dispositivo.';
    case 'PUSH_NOT_SUPPORTED':
      return 'Este navegador o contexto no soporta notificaciones push web.';
    case 'PUSH_AUTH_REQUIRED':
      return 'Necesitas una sesion activa para registrar este dispositivo.';
    case 'PUSH_SUBSCRIBE_ABORT':
      return 'Error al activar notificaciones. Intenta de nuevo.';
    default:
      return error.message || 'No pudimos actualizar las notificaciones push en este dispositivo.';
  }
}

export function NotificationPushSubscriptionCard() {
  const { enablePush, disablePush, isLoading, isSaving, status } = usePushNotifications();
  const checked = status?.isSubscribed ?? false;
  const disabled = isLoading || isSaving || status?.permission === 'unsupported';

  const handleChange = async (next: boolean) => {
    try {
      if (next) {
        const permission = await requestPushPermission();

        if (permission !== 'granted') {
          throw new Error('PUSH_PERMISSION_DENIED');
        }

        await enablePush();
      toast({ title: 'Push activado', description: 'Este dispositivo ya puede recibir avisos de Pulse.' });
      return;
      }

      await disablePush();
      toast({ title: 'Push desactivado', description: 'Este dispositivo dejó de recibir avisos push.' });
    } catch (error) {
      console.error('Error activando notificaciones push:', error);
      toast({
        title: 'No se pudo guardar',
        description: resolvePushErrorMessage(error),
        variant: 'destructive',
      });
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
