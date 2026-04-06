import { useEffect, useRef } from 'react';
import { toast } from '@/core/notifications/hooks/useToast';

interface UseSessionTimeoutParams {
  enabled: boolean;
  onTimeout: () => Promise<void>;
  timeoutMinutes?: number;
}

const SESSION_ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'click',
  'keydown',
  'mousemove',
  'scroll',
  'touchstart',
];

export function useSessionTimeout({
  enabled,
  onTimeout,
  timeoutMinutes = 30,
}: UseSessionTimeoutParams) {
  const timeoutRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const timeoutMs = Math.max(timeoutMinutes, 1) * 60 * 1000;

    const resetTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        toast({
          title: 'Sesión finalizada',
          description: 'Cerramos tu sesión por inactividad para proteger tu cuenta.',
        });
        void onTimeoutRef.current();
      }, timeoutMs);
    };

    SESSION_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      SESSION_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, timeoutMinutes]);
}
