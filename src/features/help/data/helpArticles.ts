import type { HelpArticle } from '@/features/help/types/helpContent.types';

import { paymentsArticle } from './articles/paymentsArticle';
import { projectOverviewArticle } from './articles/projectOverviewArticle';
import { pulseMetricsArticle } from './articles/pulseMetricsArticle';
import { settingsArticle } from './articles/settingsArticle';
import { supportArticle } from './articles/supportArticle';

export const CLIENT_HELP_ARTICLES: HelpArticle[] = [
  pulseMetricsArticle,
  projectOverviewArticle,
  paymentsArticle,
  supportArticle,
  settingsArticle,
];
