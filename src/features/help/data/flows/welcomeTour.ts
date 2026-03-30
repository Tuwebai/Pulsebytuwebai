import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

export const welcomeTour: TutorialFlow = {
  id: 'welcome-tour',
  name: 'Recorrido inicial',
  description: 'Ubicate rápido en Pulse y entendé dónde mirar primero.',
  icon: '🎯',
  category: 'onboarding',
  estimatedTime: 4,
  difficulty: 'beginner',
  completionReward: 'Primer recorrido completado',
  steps: [
    {
      id: 'welcome-1',
      title: 'Este es tu resumen principal',
      description:
        'Acá entrás para responder rápido si tu web está generando movimiento y si ya hay datos para leer.',
      target: '[data-tour="home-hero"]',
      position: 'bottom',
      action: 'wait',
      actionText: 'Seguir recorrido',
      skipable: false,
      required: true,
    },
    {
      id: 'welcome-2',
      title: 'Mi Proyecto vive acá',
      description:
        'Desde este bloque seguís el estado de tu proyecto sin meterte en detalles técnicos.',
      target: '[data-tour="home-project-card"]',
      position: 'bottom',
      action: 'wait',
      actionText: 'Entendido',
      skipable: true,
      tips: [
        'Si necesitás contexto de entrega, entrá desde Mi Proyecto.',
        'Vas a ver el estado general y lo próximo importante.',
      ],
    },
    {
      id: 'welcome-3',
      title: 'Pulse traduce tus métricas',
      description:
        'Vamos a la vista de Pulse para ver cómo leer las visitas, consultas y tendencia de tu web.',
      target: '[data-tour="pulse-metrics-grid"]',
      position: 'bottom',
      action: 'navigate',
      actionText: 'Ir a Pulse',
      navigateTo: '/dashboard/pulse',
      waitForNavigation: true,
      navigationDelay: 400,
      skipable: true,
      autoNavigate: true,
    },
    {
      id: 'welcome-4',
      title: 'El gráfico te muestra el ritmo',
      description:
        'No hace falta interpretar herramientas técnicas: acá ves si tu web viene creciendo, estable o más tranquila.',
      target: '[data-tour="pulse-chart"]',
      position: 'top',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'welcome-5',
      title: 'Si necesitás ayuda, Soporte es el camino',
      description:
        'Cuando algo requiera una respuesta del equipo, Pulse te lleva directo a soporte sin perder contexto.',
      target: '[data-tour="support-form"]',
      position: 'top',
      action: 'navigate',
      actionText: 'Ir a soporte',
      navigateTo: '/dashboard/soporte',
      waitForNavigation: true,
      navigationDelay: 400,
      skipable: false,
      required: true,
      autoNavigate: true,
      tips: [
        'Usá soporte para pedidos, dudas o bloqueos concretos.',
        'La ayuda sirve para orientarte; soporte sirve para resolver con el equipo.',
      ],
    },
  ],
};
