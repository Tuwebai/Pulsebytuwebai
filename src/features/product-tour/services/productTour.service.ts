import type { ProductTourPersistenceState, ProductTourScope, ProductTourStep } from '@/features/product-tour/types/productTour.types';

export const PRODUCT_TOUR_OPEN_EVENT = 'pulse:product-tour:open';
export const DEFAULT_PRODUCT_TOUR_SCOPE: ProductTourScope = 'core';

const DEFAULT_STATE: ProductTourPersistenceState = {
  completedAt: null,
  dismissedAt: null,
};

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: 'home-hero',
    scope: 'core',
    route: '/dashboard',
    target: 'home-hero',
    title: 'Este es tu resumen principal',
    description: 'Acá ves rápido si tu web está generando movimiento y si ya hay datos reales para leer.',
    placement: 'bottom',
  },
  {
    id: 'home-project-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-project-card',
    title: 'Mi Proyecto',
    description: 'Desde este bloque seguís el estado de tu proyecto sin meterte en detalles técnicos.',
    placement: 'bottom',
  },
  {
    id: 'home-payments-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-payments-card',
    title: 'Pagos',
    description: 'Acá revisás tu historial y cualquier pendiente sin salir de Pulse.',
    placement: 'bottom',
  },
  {
    id: 'home-support-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-support-card',
    title: 'Soporte',
    description: 'Si necesitás ayuda, este es tu canal directo con el equipo de TuWebAI.',
    placement: 'top',
  },
  {
    id: 'pulse-metrics-grid',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-metrics-grid',
    title: 'Pulse te traduce datos a lenguaje simple',
    description: 'Estas métricas resumen visitas, consultas y tendencia del período que estás mirando.',
    placement: 'bottom',
  },
  {
    id: 'pulse-period-selector',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-period-selector',
    title: 'Podés cambiar el período',
    description: 'Si querés comparar cómo viene tu web, cambiás el rango y Pulse recalcula la lectura.',
    placement: 'bottom',
  },
  {
    id: 'pulse-chart',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-chart',
    title: 'El gráfico muestra el ritmo',
    description: 'No hace falta leer GA4 crudo: acá ves si el tráfico viene creciendo, estable o flojo.',
    placement: 'top',
  },
  {
    id: 'pulse-top-pages',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-top-pages',
    title: 'También ves qué páginas atraen más atención',
    description: 'Esto te ayuda a entender qué parte de tu web está funcionando mejor.',
    placement: 'left',
  },
  {
    id: 'profile-header',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-header',
    title: 'Este es tu perfil dentro de Pulse',
    description: 'Acá actualizás tu identidad personal y la de tu negocio sin salir del producto.',
    placement: 'bottom',
  },
  {
    id: 'profile-avatar-card',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-avatar-card',
    title: 'Tu foto y tus datos principales viven acá',
    description: 'Este bloque concentra tu avatar, tu nombre y cómo se te ve en el resto de Pulse.',
    placement: 'bottom',
  },
  {
    id: 'profile-tabs',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-tabs',
    title: 'El perfil está ordenado por secciones',
    description: 'Datos, negocio, seguridad y cuenta están separados para que encuentres rápido lo que buscás.',
    placement: 'top',
  },
  {
    id: 'settings-root',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-root',
    title: 'Acá ajustás cómo funciona tu experiencia',
    description: 'Configuración reúne sitio, experiencia, notificaciones y seguridad en un solo lugar.',
    placement: 'bottom',
  },
  {
    id: 'settings-tabs',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-tabs',
    title: 'Las preferencias están separadas por tema',
    description: 'Cada tab agrupa un tipo de ajuste para que no tengas que recorrer toda la pantalla.',
    placement: 'top',
  },
];

function getStorageKey(userId: string, scope: ProductTourScope) {
  return `pulse:product-tour:${userId}:${scope}:state`;
}

export function getProductTourScopeFromPath(pathname: string): ProductTourScope | null {
  if (pathname === '/dashboard' || pathname === '/dashboard/pulse') {
    return 'core';
  }

  if (pathname === '/dashboard/perfil') {
    return 'profile';
  }

  if (pathname === '/dashboard/configuracion') {
    return 'settings';
  }

  return null;
}

export function getProductTourSteps(scope: ProductTourScope) {
  return PRODUCT_TOUR_STEPS.filter((step) => step.scope === scope);
}

export function readProductTourState(userId: string | null | undefined, scope: ProductTourScope): ProductTourPersistenceState {
  if (!userId || typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId, scope));

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

function writeProductTourState(userId: string, scope: ProductTourScope, nextState: ProductTourPersistenceState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId, scope), JSON.stringify(nextState));
}

export function dismissProductTour(userId: string, scope: ProductTourScope) {
  writeProductTourState(userId, scope, {
    completedAt: null,
    dismissedAt: new Date().toISOString(),
  });
}

export function completeProductTour(userId: string, scope: ProductTourScope) {
  writeProductTourState(userId, scope, {
    completedAt: new Date().toISOString(),
    dismissedAt: null,
  });
}

export function shouldAutoOpenProductTour(userId: string | null | undefined, scope: ProductTourScope) {
  const state = readProductTourState(userId, scope);
  return !state.completedAt && !state.dismissedAt;
}
