export type HelpCategory =
  | 'onboarding'
  | 'pulse'
  | 'project'
  | 'payments'
  | 'support'
  | 'settings';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: HelpCategory;
  tags: string[];
  lastUpdated: string;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  videoTutorial?: string;
  screenshots?: string[];
}
