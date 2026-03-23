import { TutorialFlow, TutorialStep, TutorialProgress } from '@/contexts/TutorialContext';

// =====================================================
// SERVICIO OPTIMIZADO PARA LÓGICA DE NEGOCIO
// =====================================================

export class TutorialService {
  private static instance: TutorialService;
  private flows: Map<string, TutorialFlow> = new Map();
  private progressCache: Map<string, TutorialProgress> = new Map();

  private constructor() {
    this.initializeFlows();
  }

  public static getInstance(): TutorialService {
    if (!TutorialService.instance) {
      TutorialService.instance = new TutorialService();
    }
    return TutorialService.instance;
  }

  // Inicializar flujos de tutorial
  private initializeFlows(): void {
    // Flujos básicos - se pueden cargar desde una API
    const basicFlows: TutorialFlow[] = [
      {
        id: 'welcome-tour',
        name: 'Tour de Bienvenida',
        description: 'Conoce las funcionalidades principales',
        icon: '🎯',
        category: 'onboarding',
        steps: [
          {
            id: 'welcome-1',
            title: 'Bienvenido a Pulse by TuWebAI',
            description: 'Te guiaremos por las funcionalidades principales de la plataforma.',
            target: '[data-tutorial="welcome"]',
            position: 'center',
            action: 'wait',
            skipable: true,
          },
          {
            id: 'welcome-2',
            title: 'Dashboard Principal',
            description: 'Aquí puedes ver el resumen de todos tus proyectos.',
            target: '[data-tutorial="dashboard"]',
            position: 'bottom',
            action: 'click',
            skipable: true,
          },
        ],
        estimatedTime: 5,
        difficulty: 'beginner',
      },
      {
        id: 'project-management',
        name: 'Gestión de Proyectos',
        description: 'Aprende a gestionar tus proyectos eficientemente',
        icon: '📁',
        category: 'feature',
        steps: [
          {
            id: 'project-1',
            title: 'Crear Proyecto',
            description: 'Aprende a crear un nuevo proyecto paso a paso.',
            target: '[data-tutorial="create-project"]',
            position: 'bottom',
            action: 'click',
            skipable: false,
          },
        ],
        estimatedTime: 10,
        difficulty: 'intermediate',
      },
    ];

    basicFlows.forEach(flow => {
      this.flows.set(flow.id, flow);
    });
  }

  // Obtener flujo por ID
  public getFlow(flowId: string): TutorialFlow | null {
    return this.flows.get(flowId) || null;
  }

  // Obtener todos los flujos
  public getAllFlows(): TutorialFlow[] {
    return Array.from(this.flows.values());
  }

  // Obtener flujos por categoría
  public getFlowsByCategory(category: string): TutorialFlow[] {
    return Array.from(this.flows.values()).filter(flow => flow.category === category);
  }

  // Validar si un elemento target existe
  public validateTarget(target: string): boolean {
    try {
      const element = document.querySelector(target);
      return element !== null;
    } catch (error) {
      console.error('Invalid target selector:', target, error);
      return false;
    }
  }

  // Obtener posición optimizada para el tooltip
  public getOptimalPosition(target: string, preferredPosition: string): string {
    if (!this.validateTarget(target)) {
      return 'center';
    }

    const element = document.querySelector(target);
    if (!element) return 'center';

    const rect = element.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Lógica para determinar la mejor posición
    const space = {
      top: rect.top,
      bottom: viewport.height - rect.bottom,
      left: rect.left,
      right: viewport.width - rect.right,
    };

    // Si hay poco espacio arriba, usar abajo
    if (space.top < 200 && space.bottom > 200) {
      return 'bottom';
    }

    // Si hay poco espacio abajo, usar arriba
    if (space.bottom < 200 && space.top > 200) {
      return 'top';
    }

    // Si hay poco espacio a la derecha, usar izquierda
    if (space.right < 300 && space.left > 300) {
      return 'left';
    }

    // Si hay poco espacio a la izquierda, usar derecha
    if (space.left < 300 && space.right > 300) {
      return 'right';
    }

    return preferredPosition;
  }

  // Calcular progreso del tutorial
  public calculateProgress(flowId: string, currentStep: number): number {
    const flow = this.getFlow(flowId);
    if (!flow) return 0;

    return Math.round((currentStep / flow.steps.length) * 100);
  }

  // Obtener tiempo estimado restante
  public getEstimatedTimeRemaining(flowId: string, currentStep: number): number {
    const flow = this.getFlow(flowId);
    if (!flow) return 0;

    const remainingSteps = flow.steps.length - currentStep;
    const avgTimePerStep = flow.estimatedTime / flow.steps.length;
    
    return Math.round(remainingSteps * avgTimePerStep);
  }

  // Verificar si un tutorial está completo
  public isTutorialComplete(flowId: string, completedSteps: string[]): boolean {
    const flow = this.getFlow(flowId);
    if (!flow) return false;

    return flow.steps.every(step => completedSteps.includes(step.id));
  }

  // Obtener siguiente paso
  public getNextStep(flowId: string, currentStepId: string): TutorialStep | null {
    const flow = this.getFlow(flowId);
    if (!flow) return null;

    const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1 || currentIndex >= flow.steps.length - 1) {
      return null;
    }

    return flow.steps[currentIndex + 1];
  }

  // Obtener paso anterior
  public getPreviousStep(flowId: string, currentStepId: string): TutorialStep | null {
    const flow = this.getFlow(flowId);
    if (!flow) return null;

    const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
    if (currentIndex <= 0) {
      return null;
    }

    return flow.steps[currentIndex - 1];
  }

  // Cachear progreso
  public cacheProgress(progress: TutorialProgress): void {
    this.progressCache.set(progress.flowId, progress);
  }

  // Obtener progreso del cache
  public getCachedProgress(flowId: string): TutorialProgress | null {
    return this.progressCache.get(flowId) || null;
  }

  // Limpiar cache
  public clearCache(): void {
    this.progressCache.clear();
  }

  // Obtener estadísticas de uso
  public getUsageStats(): {
    totalFlows: number;
    totalSteps: number;
    averageStepsPerFlow: number;
    categories: Record<string, number>;
  } {
    const flows = this.getAllFlows();
    const totalSteps = flows.reduce((sum, flow) => sum + flow.steps.length, 0);
    const categories = flows.reduce((acc, flow) => {
      acc[flow.category] = (acc[flow.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFlows: flows.length,
      totalSteps,
      averageStepsPerFlow: Math.round(totalSteps / flows.length),
      categories,
    };
  }
}

// Exportar instancia singleton
export const tutorialService = TutorialService.getInstance();
