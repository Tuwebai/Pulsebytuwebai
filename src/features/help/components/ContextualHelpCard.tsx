import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import { Card, CardContent } from '@/core/ui/card';
import type { HelpArticle } from '@/features/help/types/helpContent.types';
import { BookOpen, ChevronRight, Lightbulb, MessageCircle, ThumbsUp, X } from 'lucide-react';

import {
  getContextualArticlePreview,
  getContextualHelpArticleIcon,
  getContextualHelpCategoryLabel,
} from '@/features/help/utils/contextualHelp.utils';

interface ContextualHelpCardProps {
  helpContent: HelpArticle[];
  isExpanded: boolean;
  onClose: () => void;
  onExpand: () => void;
  onOpenHelpCenter: () => void;
  onOpenSupport: () => void;
}

export function ContextualHelpCard({
  helpContent,
  isExpanded,
  onClose,
  onExpand,
  onOpenHelpCenter,
  onOpenSupport,
}: ContextualHelpCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-xl">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-slate-800">Ayuda Pulse</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {helpContent.slice(0, isExpanded ? helpContent.length : 2).map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">
                    {getContextualHelpArticleIcon(article.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-slate-800">{article.title}</h4>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {getContextualArticlePreview(article.content)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {getContextualHelpCategoryLabel(article.category)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ThumbsUp className="w-3 h-3" />
                        {article.helpful}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {helpContent.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="w-full text-xs text-slate-600 hover:text-slate-800"
            >
              {isExpanded ? 'Mostrar menos' : `Ver ${helpContent.length - 2} más`}
              <ChevronRight className={`ml-1 w-3 h-3 ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          )}

          <div className="flex items-center gap-2 border-t border-slate-200 pt-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onOpenHelpCenter}>
              <BookOpen className="mr-1 w-3 h-3" />
              Ver ayuda
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onOpenSupport}>
              <MessageCircle className="mr-1 w-3 h-3" />
              Ir a soporte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
