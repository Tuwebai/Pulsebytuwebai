import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { useApp } from '@/contexts/useApp';
import { ProductTourOverlay } from '@/features/product-tour/components/ProductTourOverlay';
import { useProductTour } from '@/features/product-tour/hooks/useProductTour';
import SupportChatDock from '@/features/support/components/SupportChatDock';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { user } = useApp();
  const prefersReducedMotion = useReducedMotionPreference();
  const {
    currentStep,
    currentStepNumber,
    dismiss,
    goNext,
    goPrevious,
    isOpen,
    stepCount,
  } = useProductTour({ userId: user?.id });

  return (
    <div
      className="flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 transition-all duration-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      data-surface="client"
    >
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <motion.main
          animate={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 pb-24 touch-pan-y [-webkit-overflow-scrolling:touch] md:px-8 md:py-8 md:pb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
          key={location.pathname}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 sm:gap-4 lg:gap-6">
            {children}
          </div>
        </motion.main>
        <footer className="hidden border-t border-[var(--border-subtle)] px-8 py-4 md:block">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Pulse by{' '}
            <span
              className="font-medium text-transparent"
              style={{
                backgroundImage: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              TuWebAI
            </span>
          </p>
        </footer>
      </div>

      <BottomNav />
      <SupportChatDock scope="client" />

      <ProductTourOverlay
        currentStep={currentStep}
        currentStepNumber={currentStepNumber}
        onDismiss={dismiss}
        onNext={goNext}
        onPrevious={goPrevious}
        open={isOpen}
        stepCount={stepCount}
      />
    </div>
  );
}
