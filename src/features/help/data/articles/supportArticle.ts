import type { HelpArticle } from '@/features/help/types/helpContent.types';

export const supportArticle: HelpArticle = {
  id: 'support-contact',
  title: 'Cuándo usar soporte y qué esperar',
  category: 'support',
  tags: ['soporte', 'ticket', 'ayuda', 'equipo', 'consulta'],
  lastUpdated: '2026-03-29',
  author: 'Equipo Pulse',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  relatedArticles: ['project-overview', 'payments-overview'],
  content: `
# Cuándo usar soporte y qué esperar

Soporte es el canal correcto cuando necesitás una respuesta o una acción del equipo.

## Usalo para

- Reportar un problema.
- Pedir una aclaración.
- Avisar un bloqueo.
- Hacer seguimiento de una consulta anterior.

## Qué conviene incluir

- Qué pasó.
- Dónde lo viste.
- Si pasó una sola vez o sigue pasando.
- Cualquier dato que ayude a entender el contexto.

## Qué pasa después

Tu consulta queda guardada en Pulse para que puedas seguirla sin perder el hilo.
  `,
};
