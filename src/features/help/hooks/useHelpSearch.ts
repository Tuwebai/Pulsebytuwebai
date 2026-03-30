import { useCallback, useEffect, useState } from 'react';

import type { HelpArticle } from '@/features/help/types/helpContent.types';

export function useHelpSearch(helpArticles: HelpArticle[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(helpArticles);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      setFilteredArticles(helpArticles);
      return;
    }

    setFilteredArticles(
      helpArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(normalizedQuery) ||
          article.content.toLowerCase().includes(normalizedQuery) ||
          article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      ),
    );
  }, [helpArticles, searchQuery]);

  const searchHelp = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const markArticleHelpful = useCallback(() => {
    return;
  }, []);

  const getContextualHelp = useCallback(
    (context: string): HelpArticle[] =>
      helpArticles.filter((article) =>
        article.tags.some(
          (tag) =>
            context.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(context.toLowerCase()),
        ),
      ),
    [helpArticles],
  );

  return {
    filteredArticles,
    getContextualHelp,
    markArticleHelpful,
    searchHelp,
    searchQuery,
  };
}
