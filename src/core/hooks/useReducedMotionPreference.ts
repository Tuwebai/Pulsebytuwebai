import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useReducedMotionPreference(): boolean {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { user } = useApp() as AppContextType;

  return prefersReducedMotion || user?.animations_enabled === false;
}
