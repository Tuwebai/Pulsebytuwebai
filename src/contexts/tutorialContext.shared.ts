import { createContext, useContext } from 'react';

import type { TutorialContextType } from './tutorialContext.types';

export const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function useTutorial(): TutorialContextType {
  const context = useContext(TutorialContext);

  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }

  return context;
}
