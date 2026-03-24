export type ProductTourRoute = '/dashboard' | '/dashboard/pulse';

export type ProductTourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface ProductTourStep {
  id: string;
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
