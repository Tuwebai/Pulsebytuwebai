import type { HelpArticle } from '@/features/help/types/helpContent.types';
import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

import { cn } from '@/lib/utils';

import { HelpCenterArticleList } from './HelpCenterArticleList';
import { HelpCenterArticleDetail } from './HelpCenterArticleDetail';
import { HelpCenterContentHeader } from './HelpCenterContentHeader';
import { HelpCenterTutorialGrid } from './HelpCenterTutorialGrid';

interface HelpCenterMainContentProps {
  activeTab: string;
  bookmarkedArticles: string[];
  completedFlows: string[];
  filteredHelpArticles: HelpArticle[];
  filteredTutorials: TutorialFlow[];
  isMobile: boolean;
  selectedArticle: HelpArticle | null;
  onArticleSelect: (articleId: string) => void;
  onArticleBack: () => void;
  onBookmarkToggle: (articleId: string) => void;
  onClose: () => void;
  onShowSidebar: () => void;
  onStartTutorial: (flowId: string) => void;
  showSidebar: boolean;
}

export function HelpCenterMainContent({
  activeTab,
  bookmarkedArticles,
  completedFlows,
  filteredHelpArticles,
  filteredTutorials,
  isMobile,
  selectedArticle,
  onArticleSelect,
  onArticleBack,
  onBookmarkToggle,
  onClose,
  onShowSidebar,
  onStartTutorial,
  showSidebar,
}: HelpCenterMainContentProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <HelpCenterContentHeader
        activeTab={activeTab}
        articleCount={filteredHelpArticles.length}
        isArticleDetail={selectedArticle !== null}
        isMobile={isMobile}
        onClose={onClose}
        onShowSidebar={onShowSidebar}
        showSidebar={showSidebar}
        tutorialCount={filteredTutorials.length}
      />

      <div className={cn('flex-1 overflow-y-auto', isMobile ? 'p-4' : 'p-6')}>
        {activeTab === 'search' && selectedArticle ? (
          <HelpCenterArticleDetail
            article={selectedArticle}
            isBookmarked={bookmarkedArticles.includes(selectedArticle.id)}
            onBack={onArticleBack}
          />
        ) : activeTab === 'search' ? (
          <HelpCenterArticleList
            articles={filteredHelpArticles}
            bookmarkedArticles={bookmarkedArticles}
            isMobile={isMobile}
            onArticleSelect={onArticleSelect}
            onBookmarkToggle={onBookmarkToggle}
          />
        ) : (
          <HelpCenterTutorialGrid
            completedFlows={completedFlows}
            flows={filteredTutorials}
            onClose={onClose}
            onStartTutorial={onStartTutorial}
          />
        )}
      </div>
    </div>
  );
}
