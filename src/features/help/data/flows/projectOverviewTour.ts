import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

export const projectOverviewTour: TutorialFlow = {
  id: 'project-overview-tour',
  name: 'Seguir Mi Proyecto',
  description: 'Ubicá el estado de tu entrega y lo próximo importante.',
  icon: '📁',
  category: 'project',
  estimatedTime: 3,
  difficulty: 'beginner',
  steps: [
    {
      id: 'project-tour-1',
      title: 'Este resumen te ubica rápido',
      description:
        'Mi Proyecto te muestra la etapa actual de tu entrega y qué conviene mirar ahora.',
      target: '[data-tour="project-header"]',
      position: 'bottom',
      action: 'navigate',
      actionText: 'Abrir Mi Proyecto',
      navigateTo: '/dashboard/proyecto',
      waitForNavigation: true,
      navigationDelay: 400,
      skipable: false,
      required: true,
      autoNavigate: true,
    },
    {
      id: 'project-tour-2',
      title: 'El estado general aparece resumido',
      description:
        'Estas tarjetas te ayudan a ver el avance sin entrar en detalle técnico ni perder tiempo.',
      target: '[data-tour="project-stats"]',
      position: 'bottom',
      action: 'wait',
      actionText: 'Seguir',
      skipable: true,
    },
    {
      id: 'project-tour-3',
      title: 'Cada proyecto tiene su propia tarjeta',
      description:
        'Desde acá podés revisar contexto, estado y próximos pasos de cada entrega visible.',
      target: '[data-tour="project-list"]',
      position: 'top',
      action: 'wait',
      actionText: 'Terminar',
      skipable: true,
    },
  ],
};
