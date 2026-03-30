import { useTutorial } from '@/contexts/TutorialContext';

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
