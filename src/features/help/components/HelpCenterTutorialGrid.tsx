import { CheckCircle, Clock, PlayCircle, Star, Target } from 'lucide-react';
import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card';
import { cn } from '@/core/utils/cn';

import {
  getCategoryColor,
  getCategoryIcon,
  getDifficultyColor,
  getFlowCategoryLabel,
} from '@/features/help/utils/helpCenter.utils';

interface HelpCenterTutorialGridProps {
  completedFlows: string[];
  flows: TutorialFlow[];
  onClose: () => void;
  onStartTutorial: (flowId: string) => void;
}

export function HelpCenterTutorialGrid({
  completedFlows,
  flows,
  onClose,
  onStartTutorial,
}: HelpCenterTutorialGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {flows.map((flow) => {
        const isCompleted = completedFlows.includes(flow.id);

        return (
          <Card
            key={flow.id}
            className="rounded-[24px] border-[var(--border-default)] bg-[var(--bg-surface)]/94 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]/82"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)] text-2xl">
                  <span>{flow.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-medium text-[var(--text-primary)] sm:text-lg">
                    {flow.name}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {flow.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('gap-1 rounded-full border px-2.5 py-1 text-[11px]', getCategoryColor(flow.category))}
                  >
                    {getCategoryIcon(flow.category)}
                    <span>{getFlowCategoryLabel(flow.category)}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('rounded-full border px-2.5 py-1 text-[11px]', getDifficultyColor(flow.difficulty))}
                  >
                    {flow.difficulty === 'beginner'
                      ? 'Principiante'
                      : flow.difficulty === 'intermediate'
                        ? 'Intermedio'
                        : 'Avanzado'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)] sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{flow.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    <span>{flow.steps.length} pasos</span>
                  </div>
                </div>

                {flow.completionReward ? (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                    <div className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <span>{flow.completionReward}</span>
                    </div>
                  </div>
                ) : null}

                <Button
                  className="h-10 w-full rounded-xl bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
                  onClick={() => {
                    onStartTutorial(flow.id);
                    onClose();
                  }}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completado
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Iniciar recorrido
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
