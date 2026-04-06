import type { HelpArticle } from '@/features/help/types/helpContent.types';
import { Bookmark, BookmarkCheck, Clock, Eye, Search, ThumbsUp, User, Video } from 'lucide-react';

import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import { Card, CardContent } from '@/core/ui/card';
import { cn } from '@/core/utils/cn';

import {
  getArticlePreview,
  getCategoryColor,
  getCategoryIcon,
  getHelpCategoryLabel,
} from '@/features/help/utils/helpCenter.utils';

interface HelpCenterArticleListProps {
  articles: HelpArticle[];
  bookmarkedArticles: string[];
  isMobile: boolean;
  onArticleSelect: (articleId: string) => void;
  onBookmarkToggle: (articleId: string) => void;
}

export function HelpCenterArticleList({
  articles,
  bookmarkedArticles,
  isMobile,
  onArticleSelect,
  onBookmarkToggle,
}: HelpCenterArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)]/45 px-6 text-center">
        <Search className="mb-4 h-10 w-10 text-[var(--text-tertiary)]" />
        <h3 className="mb-2 text-lg font-medium text-[var(--text-primary)]">No encontramos resultados</h3>
        <p className="max-w-md text-sm text-[var(--text-secondary)]">
          Probá con otra búsqueda o elegí una categoría para encontrar la ayuda indicada.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(isMobile ? 'space-y-3' : 'space-y-4')}>
      {articles.map((article) => (
        <Card
          key={article.id}
          className="cursor-pointer rounded-[24px] border-[var(--border-default)] bg-[var(--bg-surface)]/94 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]/82"
          onClick={() => onArticleSelect(article.id)}
        >
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h4 className="text-sm font-medium leading-tight text-[var(--text-primary)] sm:text-base">
                    {article.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn('w-fit gap-1 rounded-full border px-2.5 py-1 text-[11px]', getCategoryColor(article.category))}
                  >
                    {getCategoryIcon(article.category)}
                    <span>{getHelpCategoryLabel(article.category)}</span>
                  </Badge>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {getArticlePreview(article.content)}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(article.lastUpdated).toLocaleDateString('es-AR')}</span>
                  </div>
                  {article.views > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{article.views}</span>
                    </div>
                  ) : null}
                  {article.helpful > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{article.helpful}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-2">
                <Button
                  aria-label={
                    bookmarkedArticles.includes(article.id)
                      ? `Quitar ${article.title} de guardados`
                      : `Guardar ${article.title}`
                  }
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBookmarkToggle(article.id);
                  }}
                  className="h-9 w-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                >
                  {bookmarkedArticles.includes(article.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-[var(--signal)]" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>

                {article.videoTutorial ? (
                  <Button
                    aria-label={`Ver video de ${article.title}`}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
