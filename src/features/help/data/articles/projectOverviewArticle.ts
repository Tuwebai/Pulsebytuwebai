import type { HelpArticle } from '@/features/help/types/helpContent.types';

export const projectOverviewArticle: HelpArticle = {
  id: 'project-overview',
  title: 'Qué vas a encontrar en Mi Proyecto',
  category: 'project',
  tags: ['proyecto', 'avance', 'entrega', 'estado', 'mi proyecto'],
  lastUpdated: '2026-03-29',
  author: 'Equipo Pulse',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  relatedArticles: ['pulse-metrics-overview', 'support-contact'],
  content: `
# Qué vas a encontrar en Mi Proyecto

Mi Proyecto te ayuda a seguir el estado de tu entrega sin meterte en detalles técnicos innecesarios.

## Qué podés ver

- El estado actual de tu proyecto.
- El avance general de la entrega.
- Las tarjetas de cada proyecto visible.
- El próximo paso importante para vos.

## Cuándo entrar acá

Entrá a Mi Proyecto cuando quieras entender cómo viene la entrega, revisar contexto o ubicarte antes de hablar con el equipo.

## Si necesitás una respuesta del equipo

Si tu duda requiere acción humana, abrí un ticket en soporte para que podamos ayudarte con contexto completo.
  `,
};
