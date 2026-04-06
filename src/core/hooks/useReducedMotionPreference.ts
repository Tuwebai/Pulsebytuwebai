import { useApp } from '@/contexts/useApp';
import type { AppContextType } from '@/contexts/appContext.types';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useReducedMotionPreference(): boolean {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { user } = useApp() as AppContextType;

  return prefersReducedMotion || user?.animations_enabled === false;
}
