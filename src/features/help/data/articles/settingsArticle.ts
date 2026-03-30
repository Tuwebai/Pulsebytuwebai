import type { HelpArticle } from '@/features/help/types/helpContent.types';

export const settingsArticle: HelpArticle = {
  id: 'settings-account',
  title: 'Qué podés ajustar en Configuración',
  category: 'settings',
  tags: ['configuración', 'ajustes', 'cuenta', 'notificaciones', 'seguridad'],
  lastUpdated: '2026-03-29',
  author: 'Equipo Pulse',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  relatedArticles: ['pulse-metrics-overview', 'support-contact'],
  content: `
# Qué podés ajustar en Configuración

Configuración concentra los ajustes principales de tu cuenta dentro de Pulse.

## Desde acá podés revisar

- Datos generales de tu cuenta.
- Preferencias de experiencia.
- Notificaciones.
- Opciones de seguridad disponibles.

## Cuándo conviene entrar

Entrá a configuración cuando quieras actualizar tu cuenta o ajustar cómo querés usar Pulse.

## Si necesitás ayuda

Si no encontrás una opción o no sabés qué cambiar, soporte te puede orientar.
  `,
};
