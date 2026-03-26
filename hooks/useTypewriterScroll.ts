import { useCallback, useRef, RefObject } from "react";
import { getCursorMetrics } from "../utils/graphemeUtils";

/** Golden ratio inverse — the "sweet spot" for the cursor line */
const GOLDEN_RATIO_SPOT = 0.382;

interface UseTypewriterScrollOptions {
  textareaRef: RefObject<HTMLTextAreaElement>;
  enabled: boolean;
  /** Ratio from top of viewport where cursor should sit (default: 0.382) */
  sweetSpotRatio?: number;
  /** Animation duration in ms (default: 120) */
  smoothDuration?: number;
}

/**
 * Keeps the cursor line at a fixed "sweet spot" in the viewport
 * by smoothly scrolling the textarea after each input.
 *
 * The sweet spot defaults to 38.2% from the top (golden ratio),
 * creating a natural focal point where the eye rests.
 */
export function useTypewriterScroll({
  textareaRef,
  enabled,
  sweetSpotRatio = GOLDEN_RATIO_SPOT,
  smoothDuration = 250,
}: UseTypewriterScrollOptions) {
  const animFrameRef = useRef<number | null>(null);
  const scrollStartRef = useRef<number>(0);
  const scrollTargetRef = useRef<number>(0);
  const scrollStartTimeRef = useRef<number>(0);

  const scrollToSweetSpot = useCallback(() => {
    if (!enabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get cursor's Y position in the text flow
    const { cursorY } = getCursorMetrics(textarea);

    // The sweet spot Y in the textarea's visible area
    const viewportHeight = textarea.clientHeight;
    const sweetSpotY = viewportHeight * sweetSpotRatio;

    // Desired scrollTop: place cursorY at the sweet spot
    // Account for the textarea's padding-top
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 0;
    const targetScrollTop = Math.max(0, cursorY + paddingTop - sweetSpotY);

    // Don't animate tiny movements (< 2px)
    if (Math.abs(textarea.scrollTop - targetScrollTop) < 2) return;

    // Cancel any running animation
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // Smooth scroll via requestAnimationFrame
    scrollStartRef.current = textarea.scrollTop;
    scrollTargetRef.current = targetScrollTop;
    scrollStartTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - scrollStartTimeRef.current;
      const progress = Math.min(1, elapsed / smoothDuration);

      // Ease-out quadratic for gentle deceleration
      const eased = 1 - Math.pow(1 - progress, 2);

      const current =
        scrollStartRef.current +
        (scrollTargetRef.current - scrollStartRef.current) * eased;

      textarea.scrollTop = current;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [enabled, textareaRef, sweetSpotRatio, smoothDuration]);

  return { scrollToSweetSpot };
}
