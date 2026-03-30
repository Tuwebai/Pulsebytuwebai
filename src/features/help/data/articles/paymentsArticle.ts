import type { HelpArticle } from '@/features/help/types/helpContent.types';

export const paymentsArticle: HelpArticle = {
  id: 'payments-overview',
  title: 'Dónde revisar tus pagos',
  category: 'payments',
  tags: ['pagos', 'factura', 'pendiente', 'historial', 'mantenimiento'],
  lastUpdated: '2026-03-29',
  author: 'Equipo Pulse',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  relatedArticles: ['support-contact', 'settings-account'],
  content: `
# Dónde revisar tus pagos

La sección de pagos resume tu historial y cualquier pendiente en un solo lugar.

## Qué vas a encontrar

- Estado general de tus pagos.
- Historial de movimientos.
- Pendientes, si existen.
- Acceso rápido para completar un pago.

## Cuándo conviene usarla

Entrá a pagos si querés confirmar que todo está al día o revisar un movimiento anterior.

## Si ves algo raro

Si un pago no aparece, figura duplicado o necesitás una aclaración, abrí soporte para que lo revisemos con vos.
  `,
};
