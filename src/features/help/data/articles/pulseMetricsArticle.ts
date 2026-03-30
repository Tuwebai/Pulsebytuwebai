import type { HelpArticle } from '@/features/help/types/helpContent.types';

export const pulseMetricsArticle: HelpArticle = {
  id: 'pulse-metrics-overview',
  title: 'Cómo leer Pulse sin complicarte',
  category: 'pulse',
  tags: ['pulse', 'métricas', 'visitas', 'consultas', 'tendencia'],
  lastUpdated: '2026-03-29',
  author: 'Equipo Pulse',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  relatedArticles: ['project-overview', 'support-contact'],
  content: `
# Cómo leer Pulse sin complicarte

Pulse está pensado para responder una pregunta simple: ¿tu web está funcionando?

## Qué mirar primero

- **Visitas:** cuántas personas entraron a tu web en el período elegido.
- **Consultas:** cuántas oportunidades reales generó tu sitio.
- **Tendencia:** si el movimiento viene mejor, igual o más flojo que antes.

## Cómo usar esta vista

1. Mirá el resumen principal.
2. Cambiá el período si querés comparar.
3. Revisá el gráfico para entender el ritmo.
4. Mirá qué páginas están atrayendo más atención.

## Cuándo conviene pedir ayuda

Si no entendés un cambio grande en los números o todavía no aparecen datos, escribinos desde soporte y lo revisamos con vos.
  `,
};
