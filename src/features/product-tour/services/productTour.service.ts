import type { ProductTourPersistenceState, ProductTourScope, ProductTourStep } from '@/features/product-tour/types/productTour.types';

export const PRODUCT_TOUR_OPEN_EVENT = 'pulse:product-tour:open';
export const PRODUCT_TOUR_STEP_CHANGE_EVENT = 'pulse:product-tour:step-change';
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
    description: 'Aca ves rapido si tu web esta generando movimiento y si ya hay datos reales para leer.',
    placement: 'bottom',
  },
  {
    id: 'home-project-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-project-card',
    title: 'Mi Proyecto',
    description: 'Desde este bloque seguis el estado de tu proyecto sin meterte en detalles tecnicos.',
    placement: 'bottom',
  },
  {
    id: 'home-payments-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-payments-card',
    title: 'Pagos',
    description: 'Aca revisas tu historial y cualquier pendiente sin salir de Pulse.',
    placement: 'bottom',
  },
  {
    id: 'home-support-card',
    scope: 'core',
    route: '/dashboard',
    target: 'home-support-card',
    title: 'Soporte',
    description: 'Si necesitas ayuda, este es tu canal directo con el equipo de TuWebAI.',
    placement: 'top',
  },
  {
    id: 'pulse-metrics-grid',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-metrics-grid',
    title: 'Pulse te traduce datos a lenguaje simple',
    description: 'Estas metricas resumen visitas, consultas y tendencia del periodo que estas mirando.',
    placement: 'bottom',
  },
  {
    id: 'pulse-period-selector',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-period-selector',
    title: 'Podes cambiar el periodo',
    description: 'Si queres comparar como viene tu web, cambias el rango y Pulse recalcula la lectura.',
    placement: 'bottom',
  },
  {
    id: 'pulse-chart',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-chart',
    title: 'El grafico muestra el ritmo',
    description: 'No hace falta leer GA4 crudo: aca ves si el trafico viene creciendo, estable o flojo.',
    placement: 'top',
  },
  {
    id: 'pulse-top-pages',
    scope: 'core',
    route: '/dashboard/pulse',
    target: 'pulse-top-pages',
    title: 'Tambien ves que paginas atraen mas atencion',
    description: 'Esto te ayuda a entender que parte de tu web esta funcionando mejor.',
    placement: 'left',
  },
  {
    id: 'profile-header',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-header',
    title: 'Este es tu perfil dentro de Pulse',
    description: 'Aca actualizas tu identidad personal y la de tu negocio sin salir del producto.',
    placement: 'bottom',
  },
  {
    id: 'profile-avatar-card',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-avatar-card',
    title: 'Tu foto y tus datos principales viven aca',
    description: 'Este bloque concentra tu avatar, tu nombre y como se te ve en el resto de Pulse.',
    placement: 'bottom',
  },
  {
    id: 'profile-tab-datos',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-panel-datos',
    tabValue: 'datos',
    title: 'Datos personales',
    description: 'Desde esta pestana actualizas tu nombre, telefono y la identidad base con la que apareces en Pulse.',
    placement: 'top',
  },
  {
    id: 'profile-tab-negocio',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-panel-negocio',
    tabValue: 'negocio',
    title: 'Mi negocio',
    description: 'Aca ordenas la informacion comercial que ayuda a contextualizar tus metricas.',
    placement: 'top',
  },
  {
    id: 'profile-tab-seguridad',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-panel-seguridad',
    tabValue: 'seguridad',
    title: 'Seguridad',
    description: 'Esta seccion agrupa cambios de contrasena y acciones sensibles de acceso.',
    placement: 'top',
  },
  {
    id: 'profile-tab-cuenta',
    scope: 'profile',
    route: '/dashboard/perfil',
    target: 'profile-panel-cuenta',
    tabValue: 'cuenta',
    title: 'Cuenta',
    description: 'La zona de cuenta concentra acciones delicadas, como pedir la baja a TuWebAI.',
    placement: 'top',
  },
  {
    id: 'settings-tab-general',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-panel-general',
    tabValue: 'general',
    title: 'Cuenta',
    description: 'Esta pestana resume la identidad principal de tu cuenta y datos base de acceso.',
    placement: 'bottom',
  },
  {
    id: 'settings-tab-rendimiento',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-panel-rendimiento',
    tabValue: 'rendimiento',
    title: 'Experiencia',
    description: 'Aca controlas como se siente Pulse: animaciones y modo de bajo ancho de banda.',
    placement: 'top',
  },
  {
    id: 'settings-tab-notificaciones',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-panel-notificaciones',
    tabValue: 'notificaciones',
    title: 'Notificaciones',
    description: 'En esta pestana elegis que novedades queres recibir y cuales no.',
    placement: 'top',
  },
  {
    id: 'settings-tab-seguridad',
    scope: 'settings',
    route: '/dashboard/configuracion',
    target: 'settings-panel-seguridad',
    tabValue: 'seguridad',
    title: 'Seguridad',
    description: 'Esta parte concentra el control de sesion y las decisiones de proteccion disponibles hoy.',
    placement: 'top',
  },
  {
    id: 'project-header',
    scope: 'project',
    route: '/dashboard/proyecto',
    target: 'project-header',
    title: 'Aca seguis tu entrega',
    description: 'Este resumen te ubica rapido en que etapa esta tu proyecto y que deberias mirar ahora.',
    placement: 'bottom',
  },
  {
    id: 'project-stats',
    scope: 'project',
    route: '/dashboard/proyecto',
    target: 'project-stats',
    title: 'El estado general aparece resumido',
    description: 'Estas metricas te muestran cuantos proyectos tenes visibles y como viene el avance general.',
    placement: 'bottom',
  },
  {
    id: 'project-list',
    scope: 'project',
    route: '/dashboard/proyecto',
    target: 'project-list',
    title: 'Cada proyecto vive en su propia tarjeta',
    description: 'Desde aca podes abrir detalles, revisar el estado y seguir lo que falta sin perderte.',
    placement: 'top',
  },
  {
    id: 'support-header',
    scope: 'support',
    route: '/dashboard/soporte',
    target: 'support-header',
    title: 'Soporte concentra tu conversacion con TuWebAI',
    description: 'Este modulo te deja seguir consultas, respuestas y nuevos pedidos en un solo lugar.',
    placement: 'bottom',
  },
  {
    id: 'support-summary',
    scope: 'support',
    route: '/dashboard/soporte',
    target: 'support-summary',
    title: 'Aca ves el estado de tus tickets',
    description: 'El resumen te muestra rapido que esta abierto, en progreso o ya cerrado.',
    placement: 'bottom',
  },
  {
    id: 'support-form',
    scope: 'support',
    route: '/dashboard/soporte',
    target: 'support-form',
    title: 'Desde este bloque creas una consulta nueva',
    description: 'Cuando necesites ayuda, aca escribis el tema y Pulse lo envia al equipo.',
    placement: 'top',
  },
  {
    id: 'support-tickets',
    scope: 'support',
    route: '/dashboard/soporte',
    target: 'support-tickets',
    title: 'Tus tickets quedan listados aca',
    description: 'Este panel te permite revisar historial, responder y retomar conversaciones activas.',
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

  if (pathname === '/dashboard/proyecto') {
    return 'project';
  }

  if (pathname === '/dashboard/soporte') {
    return 'support';
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
