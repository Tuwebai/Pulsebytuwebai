import type { BadgeProps } from '@/core/components/Badge';
import type { User } from '@/contexts/appContext.types';
import type { GoogleSearchConsoleConnection } from '@/data/types/google';

export type GoogleConnectionState = 'missing_site' | 'pending_review' | 'ready_to_connect';

interface ResolveGoogleConnectionStateInput {
  domain: string | null;
  website: User['website'];
  websiteStatus: User['website_status'];
}

interface GoogleConnectionCopy {
  actionLabel: string;
  badgeLabel: string;
  badgeVariant: BadgeProps['variant'];
  description: string;
  title: string;
}

export function resolveGoogleConnectionState({
  domain,
  website,
  websiteStatus,
}: ResolveGoogleConnectionStateInput): GoogleConnectionState {
  const hasWebsite = Boolean(domain || website);

  if (websiteStatus === 'pending_review' && hasWebsite) {
    return 'pending_review';
  }

  if (hasWebsite) {
    return 'ready_to_connect';
  }

  return 'missing_site';
}

export function getGoogleConnectionCopy(state: GoogleConnectionState): GoogleConnectionCopy {
  if (state === 'pending_review') {
    return {
      actionLabel: 'Ver soporte',
      badgeLabel: 'En revisión',
      badgeVariant: 'warning',
      description:
        'Ya recibimos tu web. Apenas terminemos la validación, vamos a poder avanzar con la conexión de Google desde Pulse.',
      title: 'Estamos preparando la conexión',
    };
  }

  if (state === 'ready_to_connect') {
    return {
      actionLabel: 'Solicitar conexión',
      badgeLabel: 'Listo para conectar',
      badgeVariant: 'signal',
      description:
        'Tu dominio ya está cargado. El próximo paso es conectar Google para mostrarte cómo encuentran tu web y qué páginas ya ganan visibilidad.',
      title: 'Tu web ya puede entrar a Google',
    };
  }

  return {
    actionLabel: 'Cargar mi web',
    badgeLabel: 'Falta tu web',
    badgeVariant: 'default',
    description:
      'Primero necesitamos el dominio de tu sitio. Con eso vamos a poder preparar la conexión y después mostrarte cómo te encuentran en Google.',
    title: 'Todavía no conectamos Google',
  };
}

export function getGoogleConnectionStatusCopy(connection: GoogleSearchConsoleConnection | null): GoogleConnectionCopy | null {
  if (!connection) {
    return null;
  }

  if (connection.connectionStatus === 'connected') {
    return {
      actionLabel: 'Volver a conectar',
      badgeLabel: 'Google conectado',
      badgeVariant: 'success',
      description:
        'Pulse ya quedó vinculado con Google para este proyecto. Desde acá vas a empezar a ver señales reales de visibilidad y el estado de la conexión.',
      title: 'La conexión con Google ya está activa',
    };
  }

  if (connection.connectionStatus === 'property_not_found') {
    return {
      actionLabel: 'Volver a intentar',
      badgeLabel: 'Falta acceso',
      badgeVariant: 'warning',
      description:
        'La cuenta se conectó, pero Google no devolvió una propiedad que coincida con tu dominio. Revisemos permisos o la propiedad correcta.',
      title: 'No encontramos la propiedad correcta',
    };
  }

  if (connection.connectionStatus === 'reauthorization_required') {
    return {
      actionLabel: 'Reconectar Google',
      badgeLabel: 'Requiere revisión',
      badgeVariant: 'warning',
      description:
        'La conexión anterior perdió validez. Podés volver a conectar Google para recuperar el acceso desde Pulse.',
      title: 'Necesitamos renovar la conexión',
    };
  }

  if (connection.connectionStatus === 'pending') {
    return {
      actionLabel: 'Continuar conexión',
      badgeLabel: 'Conectando',
      badgeVariant: 'signal',
      description:
        'Ya iniciamos la conexión con Google. Si quedó incompleta, podés retomarla para terminar de vincular tu proyecto.',
      title: 'Estamos conectando tu proyecto',
    };
  }

  return {
    actionLabel: 'Volver a intentar',
    badgeLabel: 'Necesita atención',
    badgeVariant: 'danger',
    description:
      'Hubo un problema al conectar Google. Vamos a volver a intentarlo con una conexión limpia desde Pulse.',
    title: 'No pudimos completar la conexión',
  };
}
