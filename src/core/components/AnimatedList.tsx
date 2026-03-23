import { Children, cloneElement, isValidElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export interface AnimatedListProps {
  children: ReactNode;
  staggerMs?: number;
  className?: string;
  disabled?: boolean;
}

interface AnimatedRevealProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  offsetY?: number;
  durationMs?: number;
}

function useShouldReduceMotion(disabled = false) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(disabled);

  useEffect(() => {
    if (disabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setPrefersReducedMotion(disabled);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [disabled]);

  return prefersReducedMotion;
}

export function AnimatedReveal({
  children,
  className,
  disabled = false,
  offsetY = 12,
  durationMs = 300
}: AnimatedRevealProps) {
  const shouldReduceMotion = useShouldReduceMotion(disabled);
  const [isVisible, setIsVisible] = useState(shouldReduceMotion);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion]);

  const style: CSSProperties | undefined = shouldReduceMotion
    ? undefined
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : `translateY(${offsetY}px)`,
        transition: `opacity ${durationMs}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${durationMs}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
      };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export default function AnimatedList({
  children,
  staggerMs = 60,
  className,
  disabled = false
}: AnimatedListProps) {
  const shouldReduceMotion = useShouldReduceMotion(disabled);
  const [isVisible, setIsVisible] = useState(shouldReduceMotion);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        const style: CSSProperties = {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0px)' : 'translateY(16px)',
          transition: 'opacity 250ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          transitionDelay: `${index * staggerMs}ms`
        };

        if (!isValidElement(child)) {
          return (
            <div style={style}>
              {child}
            </div>
          );
        }

        return cloneElement(child, {
          style: {
            ...(child.props.style as CSSProperties | undefined),
            ...style
          }
        });
      })}
    </div>
  );
}
