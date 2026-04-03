import { PRODUCT_TOUR_STEPS } from '@/features/product-tour/constants/productTour.steps';
import type { ProductTourPersistenceState, ProductTourScope } from '@/features/product-tour/types/productTour.types';

export const PRODUCT_TOUR_OPEN_EVENT = 'pulse:product-tour:open';
export const PRODUCT_TOUR_CLOSE_EVENT = 'pulse:product-tour:close';
export const PRODUCT_TOUR_STEP_CHANGE_EVENT = 'pulse:product-tour:step-change';
export const DEFAULT_PRODUCT_TOUR_SCOPE: ProductTourScope = 'core';

const DEFAULT_STATE: ProductTourPersistenceState = {
  completedAt: null,
  dismissedAt: null,
};
const LEGACY_WELCOME_TOUR_KEY = 'tutorial-welcome-tour-completed';

function getStorageKey(userId: string, scope: ProductTourScope) {
  return `pulse:product-tour:${userId}:${scope}:state`;
}

function readLegacyWelcomeTourState() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(LEGACY_WELCOME_TOUR_KEY) === 'true';
}

function writeLegacyWelcomeTourCompleted() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LEGACY_WELCOME_TOUR_KEY, 'true');
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
      if (scope === 'core' && readLegacyWelcomeTourState()) {
        return {
          completedAt: 'legacy-completed',
          dismissedAt: null,
        };
      }

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
  if (scope === 'core') {
    writeLegacyWelcomeTourCompleted();
  }

  writeProductTourState(userId, scope, {
    completedAt: null,
    dismissedAt: new Date().toISOString(),
  });
}

export function completeProductTour(userId: string, scope: ProductTourScope) {
  if (scope === 'core') {
    writeLegacyWelcomeTourCompleted();
  }

  writeProductTourState(userId, scope, {
    completedAt: new Date().toISOString(),
    dismissedAt: null,
  });
}

export function shouldAutoOpenProductTour(userId: string | null | undefined, scope: ProductTourScope) {
  const state = readProductTourState(userId, scope);
  return !state.completedAt && !state.dismissedAt;
}
