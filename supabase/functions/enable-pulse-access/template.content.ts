import type { PulseAccessEmailPayload } from './template.ts';

export interface PulseAccessEmailContent {
  eyebrow: string;
  title: string;
  intro: string;
  helper: string;
  badge: string;
  highlights: [string, string, string];
  note: string;
  cta: string;
}

export function getPulseAccessEmailContent(
  mode: PulseAccessEmailPayload['mode']
): PulseAccessEmailContent {
  if (mode === 'welcome') {
    return {
      eyebrow: 'Bienvenida a Pulse',
      title: 'Ya podés entrar a tu espacio de seguimiento',
      intro:
        'Pulse reúne en un solo lugar el estado de tu web, los avances del proyecto y lo que necesitemos de tu parte.',
      helper:
        'Cuando abras Pulse te vamos a llevar a tu espacio y, si todavía corresponde, al onboarding inicial para dejar todo listo.',
      badge: 'Acceso inicial',
      highlights: [
        'Cómo viene tu web y en qué etapa está',
        'Qué sigue ahora y si necesitamos algo de tu parte',
        'Un acceso directo a pagos, soporte y tu proyecto',
      ],
      note: 'Este enlace te deja entrar directo con tu correo, sin claves ni pasos extra.',
      cta: 'Entrar a Pulse',
    };
  }

  return {
    eyebrow: 'Acceso renovado',
    title: 'Tu enlace para volver a Pulse está listo',
    intro:
      'Te enviamos un acceso nuevo para que vuelvas a entrar a Pulse y sigas el estado de tu web desde donde la dejaste.',
    helper:
      'Cuando abras Pulse vas a entrar directo a tu espacio, con el estado más reciente de tu proyecto y tu sitio.',
    badge: 'Nuevo enlace',
    highlights: [
      'Seguir el avance de tu web',
      'Ver si hay algo pendiente de tu parte',
      'Retomar soporte, pagos y proyecto desde el mismo lugar',
    ],
    note: 'Si no fuiste vos, simplemente ignorá este correo.',
    cta: 'Volver a Pulse',
  };
}
