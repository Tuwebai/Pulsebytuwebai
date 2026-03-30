import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from '@/components/OptimizedMotion';
import { TutorialOverlayPanel } from '@/components/tutorial/TutorialOverlayPanel';
import { getTutorialTooltipPosition } from '@/components/tutorial/tutorialOverlayPosition';
import { useResponsiveTutorial } from '@/components/tutorial/useResponsiveTutorial';
import { useTutorial } from '@/contexts/TutorialContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TutorialOverlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, screenSize } = useResponsiveTutorial();
  const {
    currentFlow,
    currentStep,
    enableSounds,
    exitTutorial,
    isActive,
    nextStep,
    prevStep,
    setEnableSounds,
    skipStep,
    stepIndex,
  } = useTutorial();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      return;
    }

    const findTargetElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement | null;
      setTargetElement(element);
    };

    const timeoutId = window.setTimeout(findTargetElement, 100);

    let autoNavigateTimeout: number | undefined;
    if (currentStep.autoNavigate && currentStep.action === 'navigate' && currentStep.navigateTo) {
      autoNavigateTimeout = window.setTimeout(() => {
        navigate(currentStep.navigateTo as string);
      }, 100);
    }

    window.addEventListener('scroll', findTargetElement);
    window.addEventListener('resize', findTargetElement);

    return () => {
      window.clearTimeout(timeoutId);
      if (autoNavigateTimeout) window.clearTimeout(autoNavigateTimeout);
      window.removeEventListener('scroll', findTargetElement);
      window.removeEventListener('resize', findTargetElement);
    };
  }, [currentStep, isActive, navigate]);

  if (!isActive || !currentFlow || !currentStep) {
    return null;
  }

  const tooltipPosition = getTutorialTooltipPosition({
    currentPosition: currentStep.position,
    isMobile,
    isTablet,
    pathname: location.pathname,
    screenSize,
    targetElement,
  });

  const handleNext = () => {
    if (currentStep.action === 'navigate' && currentStep.navigateTo) {
      navigate(currentStep.navigateTo);
      nextStep();
      return;
    }

    nextStep();
  };

  return (
    <AnimatePresence>
      <motion.div initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-[9999]">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'absolute pointer-events-auto glassmorphism rounded-3xl',
            isMobile ? 'text-sm' : 'text-base',
            'touch-manipulation select-none spring-animation overflow-hidden',
          )}
          style={{ ...tooltipPosition, zIndex: 10001 }}
        >
          <TutorialOverlayPanel
            currentFlow={currentFlow}
            currentStep={currentStep}
            enableSounds={enableSounds}
            isMobile={isMobile}
            isTablet={isTablet}
            onClose={exitTutorial}
            onNext={handleNext}
            onPrev={prevStep}
            onSkip={skipStep}
            onToggleSound={() => setEnableSounds(!enableSounds)}
            stepIndex={stepIndex}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
