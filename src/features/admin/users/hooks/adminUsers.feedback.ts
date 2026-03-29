import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { EnablePulseAccessResponse } from '@/features/admin/services/pulseAccessAdminService';

export function getRoleUpdatedMessage(newRole: string) {
  return `El rol del usuario cambió a ${newRole}.`;
}

export function getPulseAccessSuccessToast(
  mode: PulseAccessActionMode,
  result: EnablePulseAccessResponse,
) {
  if (mode === 'resend') {
    if (result.email_mode === 'welcome') {
      return {
        title: 'Acceso reenviado',
        description: 'Se envió un nuevo correo de bienvenida a Pulse.',
      };
    }

    if (result.delivery_type === 'invite') {
      return {
        title: 'Acceso reenviado',
        description: 'Se envió una nueva invitación Pulse con branding TuWebAI.',
      };
    }

    if (result.delivery_type === 'magiclink') {
      return {
        title: 'Acceso reenviado',
        description: 'Se envió un nuevo enlace de acceso directo a Pulse.',
      };
    }

    return {
      title: 'Acceso reenviado',
      description:
        'El acceso Pulse del cliente sigue vigente. Si todavía no llegó el correo, revisá la configuración del mailer propio.',
    };
  }

  if (mode === 'manage') {
    return {
      title: 'Acceso Pulse al día',
      description:
        result.pulse_access_status === 'active'
          ? 'El cliente ya tiene acceso activo a Pulse.'
          : 'El cliente ya tiene una invitación vigente para entrar a Pulse.',
    };
  }

  return {
    title: 'Acceso a Pulse habilitado',
    description:
      result.pulse_access_status === 'active'
        ? 'El cliente ya tiene acceso activo a Pulse.'
        : result.email_mode === 'welcome'
          ? 'El cliente ya tiene su bienvenida Pulse lista y puede entrar desde el correo inicial.'
          : 'El cliente ya puede entrar a Pulse desde el nuevo enlace enviado.',
  };
}

export function getPulseAccessErrorMessage(mode: PulseAccessActionMode) {
  switch (mode) {
    case 'resend':
      return 'No se pudo reenviar el acceso a Pulse.';
    case 'manage':
      return 'No se pudo revisar el acceso a Pulse.';
    default:
      return 'No se pudo habilitar el acceso a Pulse.';
  }
}

export function getDeletionReviewSuccessToast(decision: 'approve' | 'deny') {
  return decision === 'approve'
    ? {
        title: 'Cuenta dada de baja',
        description: 'El usuario fue eliminado de Pulse después de la revisión admin.',
      }
    : {
        title: 'Solicitud denegada',
        description: 'El cliente ya tiene una respuesta visible en su perfil.',
      };
}
