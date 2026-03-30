import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

export const supportTour: TutorialFlow = {
  id: 'support-tour',
  name: 'Pedir ayuda al equipo',
  description: 'Entendé cuándo usar soporte y dónde seguir tus consultas.',
  icon: '🛟',
  category: 'support',
  estimatedTime: 3,
  difficulty: 'beginner',
  steps: [
    {
      id: 'support-tour-1',
      title: 'Soporte concentra tu conversación con TuWebAI',
      description:
        'Este módulo es el lugar correcto cuando necesitás una respuesta o una acción del equipo.',
      target: '[data-tour="support-header"]',
      position: 'bottom',
      action: 'navigate',
      actionText: 'Abrir soporte',
      navigateTo: '/dashboard/soporte',
      waitForNavigation: true,
      navigationDelay: 400,
      skipable: false,
      required: true,
      autoNavigate: true,
    },
    {
      id: 'support-tour-2',
      title: 'Primero mirá el resumen',
      description:
        'Acá ves rápido si ya tenés tickets abiertos, en progreso o cerrados.',
      target: '[data-tour="support-summary"]',
      position: 'bottom',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'support-tour-3',
      title: 'Desde este bloque enviás una consulta nueva',
      description:
        'Cuando necesites ayuda concreta, escribí el tema acá y el equipo lo toma desde Pulse.',
      target: '[data-tour="support-form"]',
      position: 'top',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'support-tour-4',
      title: 'Tus conversaciones quedan guardadas',
      description:
        'Este panel te deja retomar tickets anteriores sin perder el contexto.',
      target: '[data-tour="support-tickets"]',
      position: 'top',
      action: 'wait',
      actionText: 'Terminar',
      skipable: true,
    },
  ],
};
