import type { HelpArticle } from '@/features/help/types/helpContent.types';
import type {
  TutorialFlow,
  TutorialProgress,
  TutorialStep,
} from '@/features/help/types/helpFlow.types';

export type { TutorialFlow, TutorialProgress, TutorialStep } from '@/features/help/types/helpFlow.types';

export interface TutorialContextType {
  // Estado del tutorial
  isActive: boolean;
  currentFlow: TutorialFlow | null;
  currentStep: TutorialStep | null;
  stepIndex: number;
  progress: TutorialProgress | null;

  // Flujos de tutorial
  availableFlows: TutorialFlow[];
  completedFlows: string[];

  // Artículos de ayuda
  helpArticles: HelpArticle[];
  searchQuery: string;
  filteredArticles: HelpArticle[];

  // Acciones
  startTutorial: (flowId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeTutorial: () => void;
  exitTutorial: () => void;
  navigateToStep: (stepId: string) => void;
  searchHelp: (query: string) => void;
  markArticleHelpful: (articleId: string, helpful: boolean) => void;
  getContextualHelp: (context: string) => HelpArticle[];

  // Configuración
  autoStart: boolean;
  showHints: boolean;
  enableSounds: boolean;
  setAutoStart: (enabled: boolean) => void;
  setShowHints: (enabled: boolean) => void;
  setEnableSounds: (enabled: boolean) => void;
}
