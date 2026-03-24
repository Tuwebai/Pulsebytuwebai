import type { ProductTourPersistenceState, ProductTourStep } from '@/features/product-tour/types/productTour.types';

export const PRODUCT_TOUR_OPEN_EVENT = 'pulse:product-tour:open';

const DEFAULT_STATE: ProductTourPersistenceState = {
  completedAt: null,
  dismissedAt: null,
};

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: 'home-hero',
    route: '/dashboard',
    target: 'home-hero',
    title: 'Este es tu resumen principal',
    description: 'Acá ves rápido si tu web está generando movimiento y si ya hay datos reales para leer.',
    placement: 'bottom',
  },
  {
    id: 'home-project-card',
    route: '/dashboard',
    target: 'home-project-card',
    title: 'Mi Proyecto',
    description: 'Desde este bloque seguís el estado de tu proyecto sin meterte en detalles técnicos.',
    placement: 'bottom',
  },
  {
    id: 'home-payments-card',
    route: '/dashboard',
    target: 'home-payments-card',
    title: 'Pagos',
    description: 'Acá revisás tu historial y cualquier pendiente sin salir de Pulse.',
    placement: 'bottom',
  },
  {
    id: 'home-support-card',
    route: '/dashboard',
    target: 'home-support-card',
    title: 'Soporte',
    description: 'Si necesitás ayuda, este es tu canal directo con el equipo de TuWebAI.',
    placement: 'top',
  },
  {
    id: 'pulse-metrics-grid',
    route: '/dashboard/pulse',
    target: 'pulse-metrics-grid',
    title: 'Pulse te traduce datos a lenguaje simple',
    description: 'Estas métricas resumen visitas, consultas y tendencia del período que estás mirando.',
    placement: 'bottom',
  },
  {
    id: 'pulse-period-selector',
    route: '/dashboard/pulse',
    target: 'pulse-period-selector',
    title: 'Podés cambiar el período',
    description: 'Si querés comparar cómo viene tu web, cambiás el rango y Pulse recalcula la lectura.',
    placement: 'bottom',
  },
  {
    id: 'pulse-chart',
    route: '/dashboard/pulse',
    target: 'pulse-chart',
    title: 'El gráfico muestra el ritmo',
    description: 'No hace falta leer GA4 crudo: acá ves si el tráfico viene creciendo, estable o flojo.',
    placement: 'top',
  },
  {
    id: 'pulse-top-pages',
    route: '/dashboard/pulse',
    target: 'pulse-top-pages',
    title: 'También ves qué páginas atraen más atención',
    description: 'Esto te ayuda a entender qué parte de tu web está funcionando mejor.',
    placement: 'left',
  },
];

function getStorageKey(userId: string) {
  return `pulse:product-tour:${userId}:state`;
}

export function readProductTourState(userId: string | null | undefined): ProductTourPersistenceState {
  if (!userId || typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<ProductTourPersistenceState>;

    return {
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      dismissedAt: typeof parsed.dismissedAt === 'string' ? parsed.dismissedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeProductTourState(userId: string, nextState: ProductTourPersistenceState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextState));
}

export function dismissProductTour(userId: string) {
  writeProductTourState(userId, {
    completedAt: null,
    dismissedAt: new Date().toISOString(),
  });
}

export function completeProductTour(userId: string) {
  writeProductTourState(userId, {
    completedAt: new Date().toISOString(),
    dismissedAt: null,
  });
}

export function shouldAutoOpenProductTour(userId: string | null | undefined) {
  const state = readProductTourState(userId);
  return !state.completedAt && !state.dismissedAt;
}
