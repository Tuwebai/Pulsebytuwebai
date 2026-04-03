import { useEffect } from 'react';
import { shouldAutoOpenProductTour } from '@/features/product-tour/services/productTour.service';

interface TutorialAutoStartUser {
  id: string;
  role?: string | null;
}

interface UseTutorialAutoStartParams {
  autoStart: boolean;
  isAuthenticated: boolean;
  startTutorial: (flowId: string) => void;
  user: TutorialAutoStartUser | null | undefined;
}

export function useTutorialAutoStart({
  autoStart,
  isAuthenticated,
  startTutorial,
  user,
}: UseTutorialAutoStartParams) {
  useEffect(() => {
    if (!(isAuthenticated && user && autoStart && user.role !== 'admin')) {
      return;
    }

    const tutorialId = 'welcome-tour';
    const storageKey = `tutorial-${tutorialId}-completed`;
    const sessionKey = `tutorial-${tutorialId}-session-${user.id}`;

    const hasCompletedWelcome = localStorage.getItem(storageKey);
    const hasStartedThisSession = sessionStorage.getItem(sessionKey);
    const shouldOpenCoreTour = shouldAutoOpenProductTour(user.id, 'core');

    if (hasCompletedWelcome || hasStartedThisSession || !shouldOpenCoreTour) {
      return;
    }

    sessionStorage.setItem(sessionKey, 'started');

    const timeoutId = window.setTimeout(() => {
      startTutorial(tutorialId);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, user, autoStart, startTutorial]);
}
