import type {
  TutorialFlow,
  TutorialProgress,
} from './tutorialContext.types';

interface TutorialUser {
  id: string;
  role?: string | null;
}

export function getAvailableTutorialFlows(
  user: TutorialUser | null | undefined,
  flows: TutorialFlow[],
): TutorialFlow[] {
  if (!user) {
    return flows;
  }

  if (user.role === 'admin') {
    return [];
  }

  return flows;
}

export function createTutorialProgress(flowId: string): TutorialProgress {
  return {
    flowId,
    currentStep: 0,
    completedSteps: [],
    startedAt: new Date().toISOString(),
    skippedSteps: [],
    timeSpent: 0,
  };
}
