import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import type { ProductTourPlacement, ProductTourStep } from '@/features/product-tour/types/productTour.types';

interface ProductTourOverlayProps {
  currentStep: ProductTourStep | null;
  currentStepNumber: number;
  onDismiss: () => void;
  onNext: () => void;
  onPrevious: () => void;
  open: boolean;
  stepCount: number;
}

function getTooltipStyle(rect: DOMRect | null, placement: ProductTourPlacement) {
  if (!rect || placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const gap = 18;
  const viewportPadding = 20;
  const maxWidth = Math.min(360, window.innerWidth - viewportPadding * 2);
  const centeredLeft = Math.min(
    Math.max(rect.left + rect.width / 2 - maxWidth / 2, viewportPadding),
    window.innerWidth - maxWidth - viewportPadding,
  );

  if (placement === 'top') {
    return {
      top: `${Math.max(rect.top - gap, viewportPadding)}px`,
      left: `${centeredLeft}px`,
      transform: 'translateY(-100%)',
      width: `${maxWidth}px`,
    };
  }

  if (placement === 'left') {
    return {
      top: `${Math.min(Math.max(rect.top, viewportPadding), window.innerHeight - 220)}px`,
      left: `${Math.max(rect.left - maxWidth - gap, viewportPadding)}px`,
      width: `${maxWidth}px`,
    };
  }

  if (placement === 'right') {
    return {
      top: `${Math.min(Math.max(rect.top, viewportPadding), window.innerHeight - 220)}px`,
      left: `${Math.min(rect.right + gap, window.innerWidth - maxWidth - viewportPadding)}px`,
      width: `${maxWidth}px`,
    };
  }

  return {
    top: `${Math.min(rect.bottom + gap, Math.max(window.innerHeight - 220, viewportPadding))}px`,
    left: `${centeredLeft}px`,
    width: `${maxWidth}px`,
  };
}

export function ProductTourOverlay({
  currentStep,
  currentStepNumber,
  onDismiss,
  onNext,
  onPrevious,
  open,
  stepCount,
}: ProductTourOverlayProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open || !currentStep) {
      setRect(null);
      return;
    }

    let intervalId: number | null = null;
    let hasScrolledIntoView = false;

    const updateRect = () => {
      const target = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`);

      if (!target) {
        setRect(null);
        return;
      }

      if (!hasScrolledIntoView) {
        target.scrollIntoView({
          block: 'center',
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
        hasScrolledIntoView = true;
      }

      setRect(target.getBoundingClientRect());
    };

    updateRect();
    intervalId = window.setInterval(updateRect, 250);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStep, open, prefersReducedMotion]);

  const tooltipStyle = useMemo(
    () => getTooltipStyle(rect, currentStep?.placement ?? 'center'),
    [currentStep?.placement, rect],
  );

  if (!open || !currentStep) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-[rgba(4,10,20,0.68)] backdrop-blur-[2px]" />

      {rect ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-[24px] border border-[rgba(132,204,255,0.45)] shadow-[0_0_0_9999px_rgba(4,10,20,0.68)]"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
        />
      ) : null}

      <motion.aside
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto fixed w-[min(360px,calc(100vw-32px))] rounded-[24px] border border-[var(--border-strong)] bg-[rgba(9,14,28,0.96)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        style={tooltipStyle}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--signal)]">
              Paso {currentStepNumber} de {stepCount}
            </p>
            <h3 className="text-[18px] font-medium leading-6 text-[var(--text-primary)]">{currentStep.title}</h3>
          </div>

          <button
            aria-label="Cerrar recorrido"
            className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            onClick={onDismiss}
            type="button"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{currentStep.description}</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            className="text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
            onClick={onDismiss}
            type="button"
          >
            Saltar recorrido
          </button>

          <div className="flex items-center gap-2">
            {currentStepNumber > 1 ? (
              <Button onClick={onPrevious} type="button" variant="ghost">
                Atrás
              </Button>
            ) : null}

            <Button onClick={onNext} type="button" variant="signal">
              {currentStepNumber === stepCount ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
