import { useCallback, useRef } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';

interface UseTouchOptions {
  onTap?: () => void;
  hapticFeedback?: HapticIntensity;
}

const HAPTIC_PATTERNS: Record<HapticIntensity, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
};

export function useTouch(options: UseTouchOptions = {}) {
  const { onTap, hapticFeedback = 'light' } = options;
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isTouching = useRef(false);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[hapticFeedback]);
    }
  }, [hapticFeedback]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isTouching.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current || !isTouching.current) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    // If moved more than 10px, cancel the tap
    if (dx > 10 || dy > 10) {
      isTouching.current = false;
      touchStartPos.current = null;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (isTouching.current && touchStartPos.current) {
      triggerHaptic();
      onTap?.();
    }
    isTouching.current = false;
    touchStartPos.current = null;
  }, [onTap, triggerHaptic]);

  const onTouchCancel = useCallback(() => {
    isTouching.current = false;
    touchStartPos.current = null;
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}
