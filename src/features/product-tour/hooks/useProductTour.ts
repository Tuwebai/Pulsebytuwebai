import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  completeProductTour,
  PRODUCT_TOUR_CLOSE_EVENT,
  DEFAULT_PRODUCT_TOUR_SCOPE,
  dismissProductTour,
  getProductTourScopeFromPath,
  getProductTourSteps,
  PRODUCT_TOUR_OPEN_EVENT,
  PRODUCT_TOUR_STEP_CHANGE_EVENT,
  readProductTourState,
  shouldAutoOpenProductTour,
} from '@/features/product-tour/services/productTour.service';
import type { ProductTourScope } from '@/features/product-tour/types/productTour.types';

interface UseProductTourOptions {
  userId?: string | null;
}

export function useProductTour({ userId }: UseProductTourOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ProductTourScope>(DEFAULT_PRODUCT_TOUR_SCOPE);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoOpenedScopes, setAutoOpenedScopes] = useState<Partial<Record<ProductTourScope, boolean>>>({});
  const steps = useMemo(() => getProductTourSteps(scope), [scope]);
  const currentStep = steps[stepIndex] ?? null;
  const nextStep = steps[stepIndex + 1] ?? null;
  const previousStep = steps[stepIndex - 1] ?? null;
  const [persistence, setPersistence] = useState(() => readProductTourState(userId, scope));

  useEffect(() => {
    setPersistence(readProductTourState(userId, scope));
  }, [scope, userId]);

  useEffect(() => {
    const routeScope = getProductTourScopeFromPath(location.pathname);

    if (!routeScope || !userId || autoOpenedScopes[routeScope]) {
      return;
    }

    if (!shouldAutoOpenProductTour(userId, routeScope)) {
      setAutoOpenedScopes((previous) => ({ ...previous, [routeScope]: true }));
      return;
    }

    setScope(routeScope);
    setStepIndex(0);
    setIsOpen(true);
    setAutoOpenedScopes((previous) => ({ ...previous, [routeScope]: true }));
  }, [autoOpenedScopes, location.pathname, userId]);

  useEffect(() => {
    if (!isOpen || !currentStep || currentStep.route === location.pathname) {
      return;
    }

    navigate(currentStep.route);
  }, [currentStep, isOpen, location.pathname, navigate]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PRODUCT_TOUR_STEP_CHANGE_EVENT, { detail: isOpen ? currentStep : null }));
  }, [currentStep, isOpen]);

  useEffect(() => {
    const handleManualOpen = (event: Event) => {
      const requestedScope = (event as CustomEvent<ProductTourScope | undefined>).detail ?? DEFAULT_PRODUCT_TOUR_SCOPE;
      const requestedSteps = getProductTourSteps(requestedScope);

      if (!requestedSteps.length) {
        return;
      }

      setScope(requestedScope);
      setStepIndex(0);
      setIsOpen(true);
      navigate(requestedSteps[0].route);
    };

    window.addEventListener(PRODUCT_TOUR_OPEN_EVENT, handleManualOpen);

    return () => {
      window.removeEventListener(PRODUCT_TOUR_OPEN_EVENT, handleManualOpen);
    };
  }, [navigate]);

  useEffect(() => {
    const handleManualClose = () => {
      setIsOpen(false);
    };

    window.addEventListener(PRODUCT_TOUR_CLOSE_EVENT, handleManualClose);

    return () => {
      window.removeEventListener(PRODUCT_TOUR_CLOSE_EVENT, handleManualClose);
    };
  }, []);

  const close = () => {
    setIsOpen(false);
  };

  const dismiss = () => {
    if (userId) {
      dismissProductTour(userId, scope);
      setPersistence(readProductTourState(userId, scope));
    }

    close();
  };

  const complete = () => {
    if (userId) {
      completeProductTour(userId, scope);
      setPersistence(readProductTourState(userId, scope));
    }

    close();
  };

  const goNext = () => {
    if (!nextStep) {
      complete();
      return;
    }

    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const goPrevious = () => {
    if (!previousStep) {
      return;
    }

    setStepIndex((value) => Math.max(value - 1, 0));
  };

  return {
    currentStep,
    currentStepNumber: stepIndex + 1,
    dismiss,
    goNext,
    goPrevious,
    isCompleted: Boolean(persistence.completedAt),
    isDismissed: Boolean(persistence.dismissedAt),
    isOpen,
    open: (nextScope: ProductTourScope = DEFAULT_PRODUCT_TOUR_SCOPE) => {
      setScope(nextScope);
      setStepIndex(0);
      setIsOpen(true);
    },
    previousStep,
    stepCount: steps.length,
  };
}
