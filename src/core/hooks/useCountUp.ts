import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  target: number;
  duration?: number;
  enabled?: boolean;
}

export function useCountUp({
  target,
  duration = 800,
  enabled = true,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(enabled ? 0 : target);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }

    startRef.current = undefined;

    if (!enabled) {
      setValue(target);
      return;
    }

    if (target === 0) {
      setValue(0);
      return;
    }

    setValue(0);

    const animate = (timestamp: number) => {
      if (startRef.current === undefined) {
        startRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }

      startRef.current = undefined;
    };
  }, [duration, enabled, target]);

  return value;
}
