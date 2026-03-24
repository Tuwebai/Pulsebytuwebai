export type ProductTourRoute = '/dashboard' | '/dashboard/pulse' | '/dashboard/perfil' | '/dashboard/configuracion';

export type ProductTourScope = 'core' | 'profile' | 'settings';

export type ProductTourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface ProductTourStep {
  id: string;
  scope: ProductTourScope;
  route: ProductTourRoute;
  target: string;
  title: string;
  description: string;
  placement?: ProductTourPlacement;
}

export interface ProductTourPersistenceState {
  completedAt: string | null;
  dismissedAt: string | null;
}
