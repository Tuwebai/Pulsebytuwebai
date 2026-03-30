export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'wait' | 'navigate';
  actionText?: string;
  skipable?: boolean;
  required?: boolean;
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  nextStep?: string;
  prevStep?: string;
  navigateTo?: string;
  waitForNavigation?: boolean;
  navigationDelay?: number;
  autoNavigate?: boolean;
}

export interface TutorialFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'pulse' | 'project' | 'payments' | 'support' | 'settings';
  steps: TutorialStep[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  completionReward?: string;
}

export interface TutorialProgress {
  flowId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
  timeSpent: number;
}
