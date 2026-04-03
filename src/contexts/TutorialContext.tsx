import React, { useCallback, useEffect, useState } from 'react';

import type { HelpArticle } from '@/features/help/types/helpContent.types';
import { useHelpSearch } from '@/features/help/hooks/useHelpSearch';

import { useApp } from './AppContext';
import {
  HELP_ARTICLES,
  TUTORIAL_FLOWS,
} from './tutorialContext.data';
import {
  createTutorialProgress,
  getAvailableTutorialFlows,
} from './tutorialContext.helpers';
import { TutorialContext } from './tutorialContext.shared';
import type {
  TutorialContextType,
  TutorialFlow,
  TutorialProgress,
  TutorialStep,
} from './tutorialContext.types';
import { useTutorialAudio } from './useTutorialAudio';
import { useTutorialAutoStart } from './useTutorialAutoStart';

export type { TutorialContextType, TutorialFlow, TutorialProgress, TutorialStep } from './tutorialContext.types';
export type { HelpArticle } from '@/features/help/types/helpContent.types';
export { useTutorial } from './tutorialContext.shared';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<TutorialFlow | null>(null);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);

  const [availableFlows, setAvailableFlows] = useState<TutorialFlow[]>(TUTORIAL_FLOWS);
  const [completedFlows, setCompletedFlows] = useState<string[]>([]);
  const [helpArticles] = useState<HelpArticle[]>(HELP_ARTICLES);
  const [autoStart, setAutoStart] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [enableSounds, setEnableSounds] = useState(true);
  const playTutorialSound = useTutorialAudio(enableSounds);
  const {
    filteredArticles,
    getContextualHelp,
    markArticleHelpful,
    searchHelp,
    searchQuery,
  } = useHelpSearch(helpArticles);

  const exitTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(null);
    setStepIndex(0);
    setProgress(null);
  }, []);

  const completeTutorial = useCallback(() => {
    if (!currentFlow || !progress) {
      return;
    }

    setCompletedFlows((currentCompletedFlows) => [
      ...new Set([...currentCompletedFlows, currentFlow.id]),
    ]);
    localStorage.setItem(`tutorial-${currentFlow.id}-completed`, 'true');
    playTutorialSound(0.5);
    exitTutorial();
  }, [currentFlow, progress, playTutorialSound, exitTutorial]);

  const startTutorial = useCallback(
    (flowId: string) => {
      const flow = availableFlows.find((currentFlowItem) => currentFlowItem.id === flowId);
      if (!flow) {
        return;
      }

      setCurrentFlow(flow);
      setCurrentStep(flow.steps[0] ?? null);
      setStepIndex(0);
      setIsActive(true);
      setProgress(createTutorialProgress(flowId));
      playTutorialSound(0.3);
    },
    [availableFlows, playTutorialSound],
  );

  const nextStep = useCallback(() => {
    if (!currentFlow || !currentStep || !progress) {
      return;
    }

    setProgress({
      ...progress,
      completedSteps: [...progress.completedSteps, currentStep.id],
      currentStep: stepIndex + 1,
      timeSpent: progress.timeSpent + 5,
    });

    if (stepIndex < currentFlow.steps.length - 1) {
      const nextStepIndex = stepIndex + 1;
      setStepIndex(nextStepIndex);
      setCurrentStep(currentFlow.steps[nextStepIndex] ?? null);
      return;
    }

    completeTutorial();
  }, [completeTutorial, currentFlow, currentStep, progress, stepIndex]);

  const prevStep = useCallback(() => {
    if (!currentFlow || stepIndex <= 0) {
      return;
    }

    const prevStepIndex = stepIndex - 1;
    setStepIndex(prevStepIndex);
    setCurrentStep(currentFlow.steps[prevStepIndex] ?? null);
  }, [currentFlow, stepIndex]);

  const skipStep = useCallback(() => {
    if (!currentStep || !progress) {
      return;
    }

    setProgress({
      ...progress,
      skippedSteps: [...progress.skippedSteps, currentStep.id],
      currentStep: stepIndex + 1,
    });

    nextStep();
  }, [currentStep, nextStep, progress, stepIndex]);

  const navigateToStep = useCallback(
    (stepId: string) => {
      if (!currentFlow) {
        return;
      }

      const nextIndex = currentFlow.steps.findIndex((step) => step.id === stepId);
      if (nextIndex === -1) {
        return;
      }

      setStepIndex(nextIndex);
      setCurrentStep(currentFlow.steps[nextIndex] ?? null);
    },
    [currentFlow],
  );

  useEffect(() => {
    setAvailableFlows(getAvailableTutorialFlows(user, TUTORIAL_FLOWS));
  }, [user]);

  useEffect(() => {
    const completed = TUTORIAL_FLOWS
      .filter((flow) => window.localStorage.getItem(`tutorial-${flow.id}-completed`) === 'true')
      .map((flow) => flow.id);

    setCompletedFlows(completed);
  }, []);

  useTutorialAutoStart({
    autoStart,
    isAuthenticated,
    startTutorial,
    user,
  });

  const value: TutorialContextType = {
    isActive,
    currentFlow,
    currentStep,
    stepIndex,
    progress,
    availableFlows,
    completedFlows,
    helpArticles,
    searchQuery,
    filteredArticles,
    startTutorial,
    nextStep,
    prevStep,
    skipStep,
    completeTutorial,
    exitTutorial,
    navigateToStep,
    searchHelp,
    markArticleHelpful,
    getContextualHelp,
    autoStart,
    showHints,
    enableSounds,
    setAutoStart,
    setShowHints,
    setEnableSounds,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
