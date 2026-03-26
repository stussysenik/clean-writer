import { useCallback, useRef } from "react";
import type { ColorEditTarget } from "../types";

const DEFAULT_LONG_PRESS_MS = 400;
const MOVE_THRESHOLD_PX = 10;

interface UseColorEditGestureOptions {
  onTap: (target: ColorEditTarget) => void;
  onLongPress: (target: ColorEditTarget, anchorEl: HTMLElement) => void;
  longPressMs?: number;
}

/**
 * Distinguishes tap from long-press on color dot elements.
 *
 * Each element using this hook should have a `data-color-target` attribute
 * containing a JSON-serialised `ColorEditTarget`.
 *
 * - Tap (< longPressMs): calls `onTap` → typically navigates to the customiser
 * - Long-press (>= longPressMs): calls `onLongPress` → opens inline QuickColorPicker
 *
 * Cancels long-press if pointer moves more than 10 px (scroll tolerance).
 */
export function useColorEditGesture({
  onTap,
  onLongPress,
  longPressMs = DEFAULT_LONG_PRESS_MS,
}: UseColorEditGestureOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPos.current = null;
  }, []);

  const parseTarget = (el: HTMLElement): ColorEditTarget | null => {
    const raw = el.closest<HTMLElement>("[data-color-target]")?.dataset
      .colorTarget;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ColorEditTarget;
    } catch {
      return null;
    }
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = parseTarget(e.currentTarget as HTMLElement);
      if (!target) return;

      firedRef.current = false;
      startPos.current = { x: e.clientX, y: e.clientY };

      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        onLongPress(target, e.currentTarget as HTMLElement);
      }, longPressMs);
    },
    [onLongPress, longPressMs],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > MOVE_THRESHOLD_PX * MOVE_THRESHOLD_PX) {
        clear();
      }
    },
    [clear],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      clear();
      if (firedRef.current) return; // long-press already fired
      const target = parseTarget(e.currentTarget as HTMLElement);
      if (target) onTap(target);
    },
    [clear, onTap],
  );

  const onPointerCancel = useCallback(() => {
    clear();
  }, [clear]);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
