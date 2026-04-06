import { motion } from '@/core/components/OptimizedMotion';
import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import { CardHeader, CardTitle } from '@/core/ui/card';
import type { TutorialFlow, TutorialStep } from '@/contexts/tutorialContext.types';
import { cn } from '@/core/utils/cn';
import { Volume2, VolumeX, X } from 'lucide-react';

interface TutorialOverlayHeaderProps {
  currentFlow: TutorialFlow;
  currentStep: TutorialStep;
  enableSounds: boolean;
  isMobile: boolean;
  isTablet: boolean;
  onClose: () => void;
  onToggleSound: () => void;
  stepIndex: number;
}

export function TutorialOverlayHeader({
  currentFlow,
  currentStep,
  enableSounds,
  isMobile,
  isTablet,
  onClose,
  onToggleSound,
  stepIndex,
}: TutorialOverlayHeaderProps) {
  return (
    <CardHeader className={cn('pb-4 pt-6', isMobile ? 'px-5' : 'px-7')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div
            className={cn(
              'flex items-center justify-center btn-gradient-primary rounded-2xl text-white flex-shrink-0',
              'animate-pulse-glow',
              isMobile ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl',
            )}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            {currentFlow.icon}
          </motion.div>
          <div className="min-w-0 flex-1">
            <motion.div initial="hidden" animate="visible" transition={{ delay: 0.3, duration: 0.5 }}>
              <CardTitle
                className={cn(
                  'text-white leading-tight font-bold tracking-tight',
                  isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl',
                )}
              >
                {currentStep.title}
              </CardTitle>
              <div className={cn('flex items-center gap-3 mt-2', isMobile ? 'flex-col items-start' : 'flex-row')}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                >
                  <Badge className="text-xs w-fit bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-white/30 backdrop-blur-sm px-3 py-1">
                    <span className="font-bold">Paso {stepIndex + 1}</span>
                    <span className="text-white/70 ml-1">de {currentFlow.steps.length}</span>
                  </Badge>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-2 flex-shrink-0"
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSound}
            className={cn(
              'p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl spring-animation spring-hover',
              isMobile ? 'h-10 w-10' : 'h-11 w-11',
            )}
            title={enableSounds ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {enableSounds ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn(
              'p-2 text-white/80 hover:text-white hover:bg-red-500/20 rounded-xl spring-animation spring-hover',
              isMobile ? 'h-10 w-10' : 'h-11 w-11',
            )}
            title="Cerrar tutorial"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </CardHeader>
  );
}
