import { useCallback, useEffect, useRef } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = options;
  const touchStartRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);
  const doubleTapDelay = 300;

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() };

    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => onLongPress(), longPressDelay);
    }
  }, [longPressDelay, onLongPress]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const endPoint = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() };
    const deltaX = endPoint.x - touchStartRef.current.x;
    const deltaY = endPoint.y - touchStartRef.current.y;
    const deltaTime = endPoint.timestamp - touchStartRef.current.timestamp;
    const isSwipe = Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold;
    const isQuickTouch = deltaTime < 200;

    if (isSwipe) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    } else if (isQuickTouch && onTap) {
      const now = Date.now();

      if (now - lastTapRef.current < doubleTapDelay && onDoubleTap) {
        onDoubleTap();
        lastTapRef.current = 0;
      } else {
        onTap();
        lastTapRef.current = now;
      }
    }

    touchStartRef.current = null;
  }, [onDoubleTap, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, onTap, threshold]);

  const attachGestures = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart]);

  useEffect(() => () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }, []);

  return { attachGestures, handleTouchEnd, handleTouchMove, handleTouchStart };
}

export function useNavigationGestures(navigate: (path: string) => void) {
  return useTouchGestures({
    onSwipeLeft: () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    },
    onSwipeRight: () => {
      if (window.history.length > 1) {
        window.history.forward();
      }
    },
    onDoubleTap: () => navigate('/'),
    threshold: 50,
  });
}

export function useModalGestures(onClose: () => void) {
  return useTouchGestures({
    onSwipeDown: onClose,
    onSwipeUp: () => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal instanceof HTMLElement) {
        modal.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    threshold: 100,
  });
}

export function useListGestures(onRefresh?: () => void) {
  return useTouchGestures({
    onSwipeDown: () => onRefresh?.(),
    onSwipeUp: () => {
      const list = document.querySelector('[role="list"]');
      if (list instanceof HTMLElement) {
        list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      }
    },
    threshold: 80,
  });
}

export default useTouchGestures;
