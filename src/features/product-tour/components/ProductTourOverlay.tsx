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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTooltipStyle(rect: DOMRect | null, placement: ProductTourPlacement) {
  const viewportPadding = 20;
  const gap = 18;
  const panelWidth = Math.min(360, window.innerWidth - viewportPadding * 2);
  const panelHeight = 208;

  if (!rect || placement === 'center') {
    return {
      width: `${panelWidth}px`,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const centeredLeft = clamp(
    rect.left + rect.width / 2 - panelWidth / 2,
    viewportPadding,
    window.innerWidth - panelWidth - viewportPadding,
  );

  const centeredTop = clamp(
    rect.top + rect.height / 2 - panelHeight / 2,
    viewportPadding,
    window.innerHeight - panelHeight - viewportPadding,
  );

  const canPlaceBottom = rect.bottom + gap + panelHeight <= window.innerHeight - viewportPadding;
  const canPlaceTop = rect.top - gap - panelHeight >= viewportPadding;
  const canPlaceRight = rect.right + gap + panelWidth <= window.innerWidth - viewportPadding;
  const canPlaceLeft = rect.left - gap - panelWidth >= viewportPadding;

  const placements: ProductTourPlacement[] = [
    placement,
    'bottom',
    'top',
    'right',
    'left',
    'center',
  ].filter((candidate, index, array) => array.indexOf(candidate) === index);

  for (const candidate of placements) {
    if (candidate === 'bottom' && canPlaceBottom) {
      return {
        top: `${rect.bottom + gap}px`,
        left: `${centeredLeft}px`,
        width: `${panelWidth}px`,
      };
    }

    if (candidate === 'top' && canPlaceTop) {
      return {
        top: `${rect.top - gap - panelHeight}px`,
        left: `${centeredLeft}px`,
        width: `${panelWidth}px`,
      };
    }

    if (candidate === 'right' && canPlaceRight) {
      return {
        top: `${centeredTop}px`,
        left: `${rect.right + gap}px`,
        width: `${panelWidth}px`,
      };
    }

    if (candidate === 'left' && canPlaceLeft) {
      return {
        top: `${centeredTop}px`,
        left: `${rect.left - gap - panelWidth}px`,
        width: `${panelWidth}px`,
      };
    }
  }

  return {
    width: `${panelWidth}px`,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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
  const spotlightRect = rect
    ? {
        top: Math.max(rect.top - 10, 8),
        left: Math.max(rect.left - 10, 8),
        width: rect.width + 20,
        height: rect.height + 20,
      }
    : null;

  if (!open || !currentStep) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {spotlightRect ? (
        <>
          <div
            className="absolute bg-[rgba(4,10,20,0.78)]"
            style={{ top: 0, left: 0, width: '100%', height: spotlightRect.top }}
          />
          <div
            className="absolute bg-[rgba(4,10,20,0.78)]"
            style={{ top: spotlightRect.top, left: 0, width: spotlightRect.left, height: spotlightRect.height }}
          />
          <div
            className="absolute bg-[rgba(4,10,20,0.78)]"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left + spotlightRect.width,
              width: Math.max(window.innerWidth - spotlightRect.left - spotlightRect.width, 0),
              height: spotlightRect.height,
            }}
          />
          <div
            className="absolute bg-[rgba(4,10,20,0.78)]"
            style={{
              top: spotlightRect.top + spotlightRect.height,
              left: 0,
              width: '100%',
              height: Math.max(window.innerHeight - spotlightRect.top - spotlightRect.height, 0),
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[rgba(4,10,20,0.78)]" />
      )}

      {spotlightRect ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-[28px] border border-[rgba(96,165,250,0.88)] bg-[rgba(11,18,34,0.14)] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_0_8px_rgba(59,130,246,0.18),0_18px_40px_rgba(8,14,30,0.55)]"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
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
