import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  completeProductTour,
  dismissProductTour,
  PRODUCT_TOUR_STEPS,
  readProductTourState,
  shouldAutoOpenProductTour,
} from '@/features/product-tour/services/productTour.service';

interface UseProductTourOptions {
  userId?: string | null;
}

export function useProductTour({ userId }: UseProductTourOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [persistence, setPersistence] = useState(() => readProductTourState(userId));

  const currentStep = PRODUCT_TOUR_STEPS[stepIndex];
  const nextStep = PRODUCT_TOUR_STEPS[stepIndex + 1] ?? null;
  const previousStep = PRODUCT_TOUR_STEPS[stepIndex - 1] ?? null;

  useEffect(() => {
    setPersistence(readProductTourState(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId || hasAutoOpened || location.pathname !== '/dashboard') {
      return;
    }

    if (!shouldAutoOpenProductTour(userId)) {
      setHasAutoOpened(true);
      return;
    }

    setIsOpen(true);
    setStepIndex(0);
    setHasAutoOpened(true);
  }, [hasAutoOpened, location.pathname, userId]);

  useEffect(() => {
    if (!isOpen || !currentStep || currentStep.route === location.pathname) {
      return;
    }

    navigate(currentStep.route);
  }, [currentStep, isOpen, location.pathname, navigate]);

  const close = () => {
    setIsOpen(false);
  };

  const dismiss = () => {
    if (userId) {
      dismissProductTour(userId);
      setPersistence(readProductTourState(userId));
    }

    close();
  };

  const complete = () => {
    if (userId) {
      completeProductTour(userId);
      setPersistence(readProductTourState(userId));
    }

    close();
  };

  const goNext = () => {
    if (!nextStep) {
      complete();
      return;
    }

    setStepIndex((value) => Math.min(value + 1, PRODUCT_TOUR_STEPS.length - 1));
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
    open: () => {
      setIsOpen(true);
      setStepIndex(0);
    },
    previousStep,
    stepCount: PRODUCT_TOUR_STEPS.length,
  };
}
