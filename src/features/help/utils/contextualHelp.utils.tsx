import type { ReactNode } from 'react';

import { BookOpen, MessageCircle } from 'lucide-react';

import { getHelpCategoryLabel } from '@/features/help/utils/helpCenter.utils';

export function getContextualArticlePreview(content: string, maxLength = 100) {
  const plainLines = content
    .split('\n')
    .map((line) => line.replace(/[#*`]/g, '').trim())
    .filter(Boolean);

  const firstParagraph =
    plainLines.find((line) => !line.endsWith('TuWebAI') && line.length > 30) || plainLines[0] || '';

  return firstParagraph.length > maxLength
    ? `${firstParagraph.substring(0, maxLength).trim()}...`
    : firstParagraph;
}

export function getContextualHelpPositionClasses(position: string) {
  switch (position) {
    case 'top':
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2 transform';
    case 'bottom':
      return 'top-full left-1/2 mt-2 -translate-x-1/2 transform';
    case 'left':
      return 'right-full top-1/2 mr-2 -translate-y-1/2 transform';
    case 'right':
      return 'left-full top-1/2 ml-2 -translate-y-1/2 transform';
    default:
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2 transform';
  }
}

export function getContextualHelpArrowClasses(position: string) {
  switch (position) {
    case 'top':
      return 'top-full left-1/2 -translate-x-1/2 transform border-l-transparent border-r-transparent border-b-transparent border-t-slate-200';
    case 'bottom':
      return 'bottom-full left-1/2 -translate-x-1/2 transform border-l-transparent border-r-transparent border-t-transparent border-b-slate-200';
    case 'left':
      return 'left-full top-1/2 -translate-y-1/2 transform border-t-transparent border-b-transparent border-r-transparent border-l-slate-200';
    case 'right':
      return 'right-full top-1/2 -translate-y-1/2 transform border-t-transparent border-b-transparent border-l-transparent border-r-slate-200';
    default:
      return 'top-full left-1/2 -translate-x-1/2 transform border-l-transparent border-r-transparent border-b-transparent border-t-slate-200';
  }
}

export function getContextualHelpArticleIcon(category: string): ReactNode {
  if (category === 'support') {
    return <MessageCircle className="w-4 h-4 text-orange-500" />;
  }

  return <BookOpen className="w-4 h-4 text-blue-500" />;
}

export function getContextualHelpCategoryLabel(category: string) {
  return getHelpCategoryLabel(category);
}
