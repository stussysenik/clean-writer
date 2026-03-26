import { useState, useCallback, useRef, RefObject } from "react";
import { measureTextWidth } from "../utils/graphemeUtils";

interface UseDynamicPaddingOptions {
  textareaRef: RefObject<HTMLTextAreaElement>;
  enabled: boolean;
  /** Minimum padding in px (default: 21) */
  minPadding?: number;
  /** Maximum padding as fraction of container width (default: 0.30) */
  maxPaddingRatio?: number;
}

/**
 * Dynamically adjusts horizontal padding based on the current line's
 * text width so that short lines feel centered and long lines use
 * minimal padding.
 *
 * Returns padding values that should be applied as inline styles
 * to all Typewriter layers.
 */
export function useDynamicPadding({
  textareaRef,
  enabled,
  minPadding = 21,
  maxPaddingRatio = 0.30,
}: UseDynamicPaddingOptions) {
  const [paddingLeft, setPaddingLeft] = useState(minPadding);
  const lastPaddingRef = useRef(minPadding);

  const recalculate = useCallback(() => {
    if (!enabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const computed = getComputedStyle(textarea);
    const containerWidth = textarea.clientWidth;
    const maxPadding = containerWidth * maxPaddingRatio;
    const pos = textarea.selectionStart;
    const text = textarea.value;

    // Find the current visual line's text
    // Simple approach: get text from last \n before cursor to next \n after
    const beforeCursor = text.slice(0, pos);
    const lastNewline = beforeCursor.lastIndexOf("\n");
    const lineStart = lastNewline + 1;
    const nextNewline = text.indexOf("\n", pos);
    const lineEnd = nextNewline === -1 ? text.length : nextNewline;
    const lineText = text.slice(lineStart, lineEnd);

    // Measure line text width
    const font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    const lineWidth = measureTextWidth(lineText, font, computed.letterSpacing);

    // Available width for text (excluding min padding on both sides)
    const availableWidth = containerWidth - minPadding * 2;
    if (availableWidth <= 0) return;

    // Line width ratio (0 = empty, 1 = fills available width)
    const ratio = Math.min(1, lineWidth / availableWidth);

    // Padding decreases as line gets longer
    // Use ease-out curve for smoother feel
    const easedRatio = 1 - Math.pow(1 - ratio, 2);
    const targetPadding = minPadding + (maxPadding - minPadding) * (1 - easedRatio);
    const clamped = Math.max(minPadding, Math.min(maxPadding, targetPadding));

    // Only update if change is meaningful (> 1px) to avoid jitter
    if (Math.abs(clamped - lastPaddingRef.current) > 1) {
      lastPaddingRef.current = clamped;
      setPaddingLeft(Math.round(clamped));
    }
  }, [enabled, textareaRef, minPadding, maxPaddingRatio]);

  return {
    paddingLeft,
    paddingRight: paddingLeft, // symmetric
    recalculatePadding: recalculate,
  };
}
