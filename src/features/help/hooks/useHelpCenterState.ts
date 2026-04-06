import { useTutorial } from '@/contexts/tutorialContext.shared';

export function useHelpCenterState() {
  const {
    autoStart,
    availableFlows,
    completedFlows,
    enableSounds,
    filteredArticles,
    getContextualHelp,
    searchHelp,
    searchQuery,
    setAutoStart,
    setEnableSounds,
    setShowHints,
    showHints,
    startTutorial,
  } = useTutorial();

  return {
    autoStart,
    availableFlows,
    completedFlows,
    enableSounds,
    filteredArticles,
    getContextualHelp,
    searchHelp,
    searchQuery,
    setAutoStart,
    setEnableSounds,
    setShowHints,
    showHints,
    startTutorial,
  };
}
