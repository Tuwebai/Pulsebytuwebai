import { CircleAlert, CircleCheckBig } from 'lucide-react';

export type GoogleFeedbackStatus = 'connected' | 'property-not-found' | 'error' | null;

export type GoogleFeedbackReason =
  | 'access-denied'
  | 'api-disabled'
  | 'invalid-client'
  | 'invalid-session'
  | 'missing-refresh-token'
  | 'project-not-found'
  | 'property-not-found'
  | 'token-exchange-failed'
  | 'unknown'
  | null;

export function getGoogleFeedback(status: GoogleFeedbackStatus, reason: GoogleFeedbackReason) {
  if (status === 'connected') {
    return {
      className: 'border-[var(--success)]/25 bg-[var(--success-dim)] text-[var(--text-primary)]',
      description: 'Pulse ya puede usar esta conexión para traer datos del proyecto.',
      icon: CircleCheckBig,
      title: 'Google ya quedó conectado',
    };
  }

  if (status === 'property-not-found') {
    return {
      className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
      description: 'La cuenta se conectó, pero no devolvió una propiedad que coincida con tu dominio.',
      icon: CircleAlert,
      title: 'No encontramos la propiedad correcta',
    };
  }

  if (status === 'error') {
    if (reason === 'api-disabled') {
      return {
        className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
        description: 'La cuenta respondió bien, pero en Google Cloud todavía falta habilitar Search Console API para este cliente OAuth.',
        icon: CircleAlert,
        title: 'Falta habilitar la API de Search Console',
      };
    }

    if (reason === 'access-denied') {
      return {
        className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
        description: 'La conexión se canceló antes de terminar. Cuando quieras, podés volver a intentarlo desde esta misma página.',
        icon: CircleAlert,
        title: 'No se completó el permiso de Google',
      };
    }

    if (reason === 'missing-refresh-token') {
      return {
        className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
        description: 'Google no devolvió el permiso persistente que Pulse necesita para mantener esta conexión activa. Probá conectarlo otra vez.',
        icon: CircleAlert,
        title: 'Google no entregó acceso persistente',
      };
    }

    if (reason === 'invalid-session') {
      return {
        className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
        description: 'La conexión venció antes de completarse o perdió validez. Podés intentarlo de nuevo ahora.',
        icon: CircleAlert,
        title: 'La conexión con Google venció',
      };
    }

    if (reason === 'invalid-client') {
      return {
        className: 'border-[var(--danger)]/25 bg-[var(--danger-dim)] text-[var(--text-primary)]',
        description: 'La configuración segura de Google quedó desalineada. Ya tenemos un motivo concreto para revisarlo sin tocar tu proyecto.',
        icon: CircleAlert,
        title: 'La conexión segura de Google necesita ajuste',
      };
    }

    return {
      className: 'border-[var(--danger)]/25 bg-[var(--danger-dim)] text-[var(--text-primary)]',
      description: 'Probá de nuevo en unos minutos. Si persiste, revisamos la conexión desde soporte.',
      icon: CircleAlert,
      title: 'No pudimos conectar Google',
    };
  }

  return null;
}
