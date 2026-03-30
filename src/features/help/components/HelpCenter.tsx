import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHelpCenterState } from '@/features/help/hooks/useHelpCenterState';
import { PRODUCT_TOUR_CLOSE_EVENT, PRODUCT_TOUR_OPEN_EVENT } from '@/features/product-tour/services/productTour.service';
import type { ProductTourScope } from '@/features/product-tour/types/productTour.types';
import { useResponsiveHelpCenter } from '@/features/help/hooks/useResponsiveHelpCenter';
import { cn } from '@/lib/utils';

import { HelpCenterMainContent } from './HelpCenterMainContent';
import { HelpCenterSidebar } from './HelpCenterSidebar';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

function getProductTourScopeFromHelpCategory(category: string): ProductTourScope {
  if (category === 'project') {
    return 'project';
  }

  if (category === 'support') {
    return 'support';
  }

  if (category === 'settings') {
    return 'settings';
  }

  return 'core';
}

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const navigate = useNavigate();
  const { isMobile, isTablet, showSidebar, setShowSidebar } = useResponsiveHelpCenter();
  const {
    availableFlows,
    completedFlows,
    searchQuery,
    filteredArticles,
    searchHelp,
  } = useHelpCenterState();

  const [activeTab, setActiveTab] = useState('search');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setSearchInput(searchQuery);
    }
  }, [isOpen, searchQuery]);

  useEffect(() => {
    setSelectedArticleId(null);
  }, [activeTab, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setSelectedArticleId(null);
    searchHelp(query);
  };

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleArticleBack = () => {
    setSelectedArticleId(null);
  };

  const handleBookmarkToggle = (articleId: string) => {
    setBookmarkedArticles((currentBookmarks) =>
      currentBookmarks.includes(articleId)
        ? currentBookmarks.filter((currentId) => currentId !== articleId)
        : [...currentBookmarks, articleId],
    );
  };

  const filteredTutorials = availableFlows.filter(
    (flow) => selectedCategory === 'all' || flow.category === selectedCategory,
  );
  const filteredHelpArticles = filteredArticles.filter(
    (article) => selectedCategory === 'all' || article.category === selectedCategory,
  );
  const selectedArticle =
    filteredArticles.find((article) => article.id === selectedArticleId) ?? null;
  const handleStartTutorial = (flowId: string) => {
    const flow = availableFlows.find((currentFlow) => currentFlow.id === flowId);
    if (!flow) {
      return;
    }

    window.dispatchEvent(new CustomEvent(PRODUCT_TOUR_CLOSE_EVENT));
    window.dispatchEvent(
      new CustomEvent(PRODUCT_TOUR_OPEN_EVENT, {
        detail: getProductTourScopeFromHelpCategory(flow.category),
      }),
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className={cn(
          'h-[84vh] overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)]/98 p-0 text-[var(--text-primary)] shadow-[0_32px_90px_rgba(0,0,0,0.6)] backdrop-blur',
          isMobile ? '!w-[96vw] !max-w-[96vw]' : isTablet ? '!w-[92vw] !max-w-[92vw]' : '!w-[94vw] !max-w-[1360px]',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,158,245,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(123,76,212,0.10),transparent_28%)]" />

        <DialogHeader className="sr-only">
          <DialogTitle>Ayuda Pulse</DialogTitle>
          <DialogDescription>
            Encontrá respuestas rápidas y recorridos breves para usar Pulse como cliente.
          </DialogDescription>
        </DialogHeader>

        <div className={cn('relative flex h-full min-h-0', isMobile ? 'flex-col' : 'flex-row')}>
          <HelpCenterSidebar
            activeTab={activeTab}
            completedFlows={completedFlows}
            filteredTutorials={filteredTutorials}
            isMobile={isMobile}
            isTablet={isTablet}
            onActiveTabChange={setActiveTab}
            onClose={onClose}
            onNavigate={(path) => {
              navigate(path);
              onClose();
            }}
            onSearchChange={handleSearch}
            onSelectedCategoryChange={setSelectedCategory}
            onStartTutorial={handleStartTutorial}
            searchInput={searchInput}
            selectedCategory={selectedCategory}
            setShowSidebar={setShowSidebar}
            showSidebar={showSidebar}
          />

          <HelpCenterMainContent
            activeTab={activeTab}
            bookmarkedArticles={bookmarkedArticles}
            completedFlows={completedFlows}
            filteredHelpArticles={filteredHelpArticles}
            filteredTutorials={filteredTutorials}
            isMobile={isMobile}
            onArticleBack={handleArticleBack}
            onArticleSelect={handleArticleSelect}
            onBookmarkToggle={handleBookmarkToggle}
            onClose={onClose}
            onShowSidebar={() => setShowSidebar(true)}
            onStartTutorial={handleStartTutorial}
            selectedArticle={selectedArticle}
            showSidebar={showSidebar}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
