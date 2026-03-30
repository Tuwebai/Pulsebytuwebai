import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

export const pulseMetricsTour: TutorialFlow = {
  id: 'pulse-metrics-tour',
  name: 'Entender Pulse',
  description: 'Aprendé a leer las métricas sin entrar en lenguaje técnico.',
  icon: '📈',
  category: 'pulse',
  estimatedTime: 4,
  difficulty: 'beginner',
  prerequisites: ['welcome-tour'],
  steps: [
    {
      id: 'pulse-tour-1',
      title: 'Arrancá por las métricas principales',
      description:
        'Pulse resume lo más importante para que sepas si tu web está atrayendo visitas y generando oportunidades.',
      target: '[data-tour="pulse-metrics-grid"]',
      position: 'bottom',
      action: 'navigate',
      actionText: 'Abrir Pulse',
      navigateTo: '/dashboard/pulse',
      waitForNavigation: true,
      navigationDelay: 400,
      skipable: false,
      required: true,
      autoNavigate: true,
    },
    {
      id: 'pulse-tour-2',
      title: 'Podés comparar períodos',
      description:
        'Cambiando el rango entendés si tu web viene mejor, igual o más floja que antes.',
      target: '[data-tour="pulse-period-selector"]',
      position: 'bottom',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'pulse-tour-3',
      title: 'El gráfico marca la tendencia',
      description:
        'Acá se ve el ritmo general del tráfico sin tener que interpretar reportes complejos.',
      target: '[data-tour="pulse-chart"]',
      position: 'top',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'pulse-tour-4',
      title: 'Tus páginas más fuertes aparecen acá',
      description:
        'Este bloque te ayuda a entender qué parte de tu web está atrayendo más atención.',
      target: '[data-tour="pulse-top-pages"]',
      position: 'left',
      action: 'wait',
      actionText: 'Terminar',
      skipable: true,
    },
  ],
};
