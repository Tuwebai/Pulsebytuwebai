import { Target } from 'lucide-react';

import { Button } from '@/core/ui/button';
import type { TutorialFlow } from '@/features/help/types/helpFlow.types';
import { getDifficultyColor } from '@/features/help/utils/helpCenter.utils';
import { cn } from '@/lib/utils';

interface HelpCenterTutorialListProps {
  completedFlows: string[];
  flows: TutorialFlow[];
  onClose: () => void;
  onStartTutorial: (flowId: string) => void;
}

export function HelpCenterTutorialList({
  completedFlows,
  flows,
  onClose,
  onStartTutorial,
}: HelpCenterTutorialListProps) {
  return (
    <div className="space-y-3">
      {flows.map((flow) => {
        const isCompleted = completedFlows.includes(flow.id);

        return (
          <div
            key={flow.id}
            className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)] text-2xl">
                <span>{flow.icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-[var(--text-primary)]">{flow.name}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{flow.description}</p>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-1 text-[11px]',
                      getDifficultyColor(flow.difficulty),
                    )}
                  >
                    {flow.difficulty === 'beginner'
                      ? 'Principiante'
                      : flow.difficulty === 'intermediate'
                        ? 'Intermedio'
                        : 'Avanzado'}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <Target className="h-3.5 w-3.5" />
                    {flow.estimatedTime} min
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              className="mt-4 h-10 w-full rounded-xl bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
              onClick={() => {
                onStartTutorial(flow.id);
                onClose();
              }}
              disabled={isCompleted}
            >
              {isCompleted ? 'Completado' : 'Iniciar recorrido'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
