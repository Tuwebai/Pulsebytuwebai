import type { BadgeProps } from '@/core/components/Badge';
import type { User } from '@/contexts/appContext.types';

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

