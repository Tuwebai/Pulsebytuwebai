import { motion } from '@/core/components/OptimizedMotion';
import { TutorialOverlayHeader } from '@/features/product-tour/components/TutorialOverlayHeader';
import { Button } from '@/core/ui/button';
import { CardContent } from '@/core/ui/card';
import type { TutorialFlow, TutorialStep } from '@/contexts/TutorialContext';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Lightbulb, SkipForward, Star } from 'lucide-react';

interface TutorialOverlayPanelProps {
  currentFlow: TutorialFlow;
  currentStep: TutorialStep;
  enableSounds: boolean;
  isMobile: boolean;
  isTablet: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onToggleSound: () => void;
  stepIndex: number;
}

export function TutorialOverlayPanel({
  currentFlow,
  currentStep,
  enableSounds,
  isMobile,
  isTablet,
  onClose,
  onNext,
  onPrev,
  onSkip,
  onToggleSound,
  stepIndex,
}: TutorialOverlayPanelProps) {
  return (
    <div className="relative">
      <TutorialOverlayHeader
        currentFlow={currentFlow}
        currentStep={currentStep}
        enableSounds={enableSounds}
        isMobile={isMobile}
        isTablet={isTablet}
        onClose={onClose}
        onToggleSound={onToggleSound}
        stepIndex={stepIndex}
      />

      <CardContent className={cn('space-y-4', isMobile ? 'px-5' : 'px-7')}>
        <motion.div initial="hidden" animate="visible" transition={{ delay: 0.5, duration: 0.6 }}>
          <p
            className={cn(
              'content-long font-medium leading-relaxed tracking-wide text-white/90',
              isMobile ? 'text-sm' : 'text-base',
            )}
          >
            {currentStep.description}
          </p>
        </motion.div>

        {currentStep.tips && currentStep.tips.length > 0 && (
          <motion.div
            className={cn(
              'rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm',
              isMobile ? 'p-3' : 'p-4',
            )}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-yellow-500/20 p-2">
                <Lightbulb className={cn('text-yellow-400', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
              </div>
              <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
                Consejos útiles
              </span>
            </div>
            <ul className="space-y-2">
              {currentStep.tips.map((tip, index) => (
                <motion.li
                  key={index}
                  className={cn(
                    'flex items-start gap-3 text-white/80',
                    isMobile ? 'text-sm' : 'text-base',
                  )}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                >
                  <span className="mt-1 flex-shrink-0 font-bold text-yellow-400">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          className={cn(
            'justify-between gap-4 border-t border-white/20 pt-4',
            isMobile ? 'flex flex-col items-stretch' : 'flex flex-row items-center',
          )}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className={cn('flex items-center gap-3', isMobile ? 'order-2' : 'order-1')}>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={stepIndex === 0}
              className={cn(
                'spring-animation spring-hover border-2 border-white/30 bg-white/10 text-sm text-white hover:border-white/50 hover:bg-white/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isMobile ? 'h-12 flex-1' : 'h-12 flex-none',
              )}
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              <span>Anterior</span>
            </Button>

            {currentStep.skipable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className={cn(
                  'spring-animation spring-hover text-sm text-white/70 hover:bg-white/10 hover:text-white',
                  isMobile ? 'h-10' : isTablet ? 'h-11' : 'h-12',
                )}
              >
                <SkipForward className="mr-2 w-5 h-5" />
                <span>Omitir</span>
              </Button>
            )}
          </div>

          <div className={cn('flex items-center gap-3', isMobile ? 'order-1' : 'order-2')}>
            {stepIndex === currentFlow.steps.length - 1 ? (
              <Button
                onClick={onNext}
                className={cn(
                  'btn-gradient-accent spring-animation spring-hover ripple-effect h-12 text-sm text-white',
                  isMobile ? 'flex-1' : 'flex-none',
                )}
              >
                <Star className="mr-2 w-5 h-5" />
                <span>Completar</span>
              </Button>
            ) : (
              <Button
                onClick={onNext}
                className={cn(
                  'btn-gradient-primary spring-animation spring-hover ripple-effect h-12 text-sm text-white',
                  isMobile ? 'flex-1' : 'flex-none',
                )}
              >
                <span>Siguiente</span>
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </motion.div>
      </CardContent>
    </div>
  );
}
