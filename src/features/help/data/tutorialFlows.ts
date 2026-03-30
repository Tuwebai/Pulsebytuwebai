import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

import { projectOverviewTour } from './flows/projectOverviewTour';
import { pulseMetricsTour } from './flows/pulseMetricsTour';
import { supportTour } from './flows/supportTour';
import { welcomeTour } from './flows/welcomeTour';

export const CLIENT_TUTORIAL_FLOWS: TutorialFlow[] = [
  welcomeTour,
  pulseMetricsTour,
  projectOverviewTour,
  supportTour,
];
