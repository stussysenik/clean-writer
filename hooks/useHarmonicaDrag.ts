import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export type HarmonicaStage = 'closed' | 'peek' | 'expand' | 'full';

interface HarmonicaDragState {
  stage: HarmonicaStage;
  isDragging: boolean;
  dragProgress: number; // 0-1 progress towards next stage
  dragDirection: 'left' | 'up' | null;
}

interface HarmonicaDragHandlers {
  onDragStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragMove: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd: () => void;
}

interface UseHarmonicaDragOptions {
  reducedMotion?: boolean;
  onStageChange?: (stage: HarmonicaStage) => void;
}

interface UseHarmonicaDragReturn {
  state: HarmonicaDragState;
  handlers: HarmonicaDragHandlers;
  setStage: (stage: HarmonicaStage) => void;
  close: () => void;
}

// Drag thresholds for each stage transition
const THRESHOLDS = {
  PEEK: 40,    // Drag left from closed → peek
  EXPAND: 60,  // Drag up from peek → expand
  FULL: 80,    // Drag left from expand → full
};

// Commit ratio: if drag exceeds this percentage of threshold, commit to next stage
const COMMIT_RATIO = 0.5;

// Stage transitions mapping
const STAGE_TRANSITIONS: Record<HarmonicaStage, {
  nextStage: HarmonicaStage | null;
  prevStage: HarmonicaStage | null;
  dragDirection: 'left' | 'up';
  threshold: number;
}> = {
  closed: { nextStage: 'peek', prevStage: null, dragDirection: 'left', threshold: THRESHOLDS.PEEK },
  peek: { nextStage: 'expand', prevStage: 'closed', dragDirection: 'up', threshold: THRESHOLDS.EXPAND },
  expand: { nextStage: 'full', prevStage: 'peek', dragDirection: 'left', threshold: THRESHOLDS.FULL },
  full: { nextStage: null, prevStage: 'expand', dragDirection: 'left', threshold: THRESHOLDS.FULL },
};

// Haptic feedback patterns
const triggerHaptic = (pattern: 'snap' | 'fullOpen' | 'resistance') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    switch (pattern) {
      case 'snap':
        navigator.vibrate([15, 5, 15]); // Double tap feel
        break;
      case 'fullOpen':
        navigator.vibrate([20, 10, 20, 10, 30]); // Gear engaged
        break;
      case 'resistance':
        navigator.vibrate(5); // Subtle resistance
        break;
    }
  }
};

export function useHarmonicaDrag(options: UseHarmonicaDragOptions = {}): UseHarmonicaDragReturn {
  const { reducedMotion = false, onStageChange } = options;

  const [stage, setStageInternal] = useState<HarmonicaStage>('closed');
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'up' | null>(null);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastHapticRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return reducedMotion;
    return reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [reducedMotion]);

  const setStage = useCallback((newStage: HarmonicaStage) => {
    setStageInternal(newStage);
    onStageChange?.(newStage);
  }, [onStageChange]);

  const close = useCallback(() => {
    setStage('closed');
    setDragProgress(0);
  }, [setStage]);

  const getClientCoords = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const coords = getClientCoords(e);
    dragStartRef.current = coords;
    setIsDragging(true);
    setDragProgress(0);
    setDragDirection(null);
  }, []);

  const onDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!dragStartRef.current || !isDragging) return;

    const coords = getClientCoords(e);
    const deltaX = dragStartRef.current.x - coords.x; // Positive = dragging left
    const deltaY = dragStartRef.current.y - coords.y; // Positive = dragging up

    const transition = STAGE_TRANSITIONS[stage];

    // Determine primary drag direction based on current stage expectation
    const expectedDirection = transition.dragDirection;
    const primaryDelta = expectedDirection === 'left' ? deltaX : deltaY;

    // Calculate progress (0-1) towards threshold
    const progress = Math.max(0, Math.min(1, primaryDelta / transition.threshold));

    setDragProgress(progress);
    setDragDirection(primaryDelta > 0 ? expectedDirection : null);

    // Trigger resistance haptic at certain thresholds
    if (!prefersReducedMotion && progress > 0.3 && progress < 0.5) {
      const now = Date.now();
      if (now - lastHapticRef.current > 100) {
        triggerHaptic('resistance');
        lastHapticRef.current = now;
      }
    }

    // Handle reverse drag (collapsing)
    if (primaryDelta < 0 && transition.prevStage) {
      const reverseProgress = Math.abs(primaryDelta) / transition.threshold;
      if (reverseProgress > COMMIT_RATIO) {
        setStage(transition.prevStage);
        dragStartRef.current = coords; // Reset drag start for new stage
        setDragProgress(0);
        if (!prefersReducedMotion) {
          triggerHaptic('snap');
        }
      }
    }
  }, [isDragging, stage, prefersReducedMotion, setStage]);

  const onDragEnd = useCallback(() => {
    if (!isDragging) return;

    const transition = STAGE_TRANSITIONS[stage];

    // If progress exceeds commit ratio, advance to next stage
    if (dragProgress >= COMMIT_RATIO && transition.nextStage) {
      setStage(transition.nextStage);
      if (!prefersReducedMotion) {
        if (transition.nextStage === 'full') {
          triggerHaptic('fullOpen');
        } else {
          triggerHaptic('snap');
        }
      }
    }

    // Reset drag state
    setIsDragging(false);
    setDragProgress(0);
    setDragDirection(null);
    dragStartRef.current = null;
  }, [isDragging, stage, dragProgress, prefersReducedMotion, setStage]);

  // Global event listeners for drag continuation outside element
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      const coords = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

      if (!dragStartRef.current) return;

      const deltaX = dragStartRef.current.x - coords.x;
      const deltaY = dragStartRef.current.y - coords.y;

      const transition = STAGE_TRANSITIONS[stage];
      const expectedDirection = transition.dragDirection;
      const primaryDelta = expectedDirection === 'left' ? deltaX : deltaY;

      const progress = Math.max(0, Math.min(1, primaryDelta / transition.threshold));
      setDragProgress(progress);
      setDragDirection(primaryDelta > 0 ? expectedDirection : null);
    };

    const handleGlobalEnd = () => {
      onDragEnd();
    };

    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchmove', handleGlobalMove, { passive: true });
    document.addEventListener('touchend', handleGlobalEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, stage, onDragEnd]);

  return {
    state: {
      stage,
      isDragging,
      dragProgress,
      dragDirection,
    },
    handlers: {
      onDragStart,
      onDragMove,
      onDragEnd,
    },
    setStage,
    close,
  };
}

export default useHarmonicaDrag;
