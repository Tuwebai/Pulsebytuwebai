import { Fragment, type ReactNode } from 'react';
import { ArrowLeft, BookmarkCheck, CalendarDays, User } from 'lucide-react';
import type { HelpArticle } from '@/features/help/types/helpContent.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  getCategoryColor,
  getCategoryIcon,
  getHelpCategoryLabel,
} from '@/features/help/utils/helpCenter.utils';

interface HelpCenterArticleDetailProps {
  article: HelpArticle;
  isBookmarked: boolean;
  onBack: () => void;
}

function renderInlineContent(text: string): ReactNode {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`} className="font-medium text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function renderArticleLine(line: string, index: number) {
  if (line.startsWith('# ')) {
    return <h2 key={index} className="text-2xl font-medium text-[var(--text-primary)]">{renderInlineContent(line.slice(2))}</h2>;
  }

  if (line.startsWith('## ')) {
    return <h3 key={index} className="mt-2 text-base font-medium text-[var(--text-primary)]">{renderInlineContent(line.slice(3))}</h3>;
  }

  if (line.startsWith('- ')) {
    return (
      <li key={index} className="text-sm leading-7 text-[var(--text-secondary)]">
        {renderInlineContent(line.slice(2))}
      </li>
    );
  }

  if (/^\d+\.\s+/.test(line)) {
    return (
      <li key={index} className="text-sm leading-7 text-[var(--text-secondary)]">
        {renderInlineContent(line.replace(/^\d+\.\s+/, ''))}
      </li>
    );
  }

  return <p key={index} className="text-sm leading-7 text-[var(--text-secondary)]">{renderInlineContent(line)}</p>;
}

export function HelpCenterArticleDetail({
  article,
  isBookmarked,
  onBack,
}: HelpCenterArticleDetailProps) {
  const lines = article.content.split('\n').map((line) => line.trim()).filter(Boolean);
  const bulletLines = lines.filter((line) => line.startsWith('- '));
  const orderedLines = lines.filter((line) => /^\d+\.\s+/.test(line));
  const contentLines = lines.filter((line) => !line.startsWith('- ') && !/^\d+\.\s+/.test(line));

  return (
    <div className="space-y-6">
      <Button
        aria-label="Volver a la lista de ayuda"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-10 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/94 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={`gap-1 rounded-full border px-2.5 py-1 text-[11px] ${getCategoryColor(article.category)}`}>
            {getCategoryIcon(article.category)}
            <span>{getHelpCategoryLabel(article.category)}</span>
          </Badge>
          {isBookmarked ? (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--signal)]">
              <BookmarkCheck className="h-3.5 w-3.5" />
              Guardado
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {contentLines.map(renderArticleLine)}
          {bulletLines.length > 0 ? <ul className="space-y-2 pl-5">{bulletLines.map(renderArticleLine)}</ul> : null}
          {orderedLines.length > 0 ? <ol className="space-y-2 pl-5">{orderedLines.map(renderArticleLine)}</ol> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{article.author}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(article.lastUpdated).toLocaleDateString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
}
