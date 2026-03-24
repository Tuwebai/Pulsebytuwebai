import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';

export interface AnimatedListProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  staggerMs?: number;
  disabled?: boolean;
}

interface AnimatedRevealProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  disabled?: boolean;
  offsetY?: number;
  durationMs?: number;
}

function useShouldReduceMotion(disabled = false) {
  const reducedMotionPreference = useReducedMotionPreference();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(disabled || reducedMotionPreference);

  useEffect(() => {
    setPrefersReducedMotion(disabled || reducedMotionPreference);
  }, [disabled, reducedMotionPreference]);

  return prefersReducedMotion;
}

export function AnimatedReveal({
  children,
  className,
  disabled = false,
  offsetY = 12,
  durationMs = 300,
  style: externalStyle,
  ...rest
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

  return <div className={className} style={{ ...(externalStyle ?? {}), ...(style ?? {}) }} {...rest}>{children}</div>;
}

export default function AnimatedList({
  children,
  staggerMs = 60,
  className,
  disabled = false,
  style: externalStyle,
  ...rest
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
    return <div className={className} style={externalStyle} {...rest}>{children}</div>;
  }

  return (
    <div className={className} style={externalStyle} {...rest}>
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
