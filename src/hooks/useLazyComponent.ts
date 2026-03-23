import type { ComponentType } from 'react';
import {
  useLazyComponent as baseUseLazyComponent,
  useLazyLoading,
} from './useLazyLoading';

interface LazyComponentOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export { baseUseLazyComponent as useLazyComponent };

export const usePreloadComponent = () => {
  const preload = <T extends ComponentType<unknown>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    setTimeout(() => {
      void importFn().catch((error: unknown) => {
        console.error('Error preloading component:', error);
      });
    }, 0);
  };

  return { preload };
};

export const useLazyComponents = <
  T extends Record<string, ComponentType<unknown>>
>(
  importFns: Record<keyof T, () => Promise<{ default: T[keyof T] }>>,
  options: LazyComponentOptions = {}
) => {
  const loadingState = useLazyLoading(options);
  const components = {} as Record<
    keyof T,
    ReturnType<typeof baseUseLazyComponent<T[keyof T]>>
  >;

  (Object.keys(importFns) as Array<keyof T>).forEach((key) => {
    components[key] = {
      ...baseUseLazyComponent(importFns[key], options),
      isVisible: loadingState.isVisible,
      isLoaded: loadingState.isLoaded,
      ref: loadingState.ref,
    };
  });

  return components;
};

export default baseUseLazyComponent;
