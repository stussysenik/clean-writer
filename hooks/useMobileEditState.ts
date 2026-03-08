import { useState, useEffect, useCallback, useRef } from "react";

export type MobileEditState = "editing" | "viewing";

/**
 * Tracks whether the user is actively editing (textarea focused) or viewing.
 * Uses a blur delay (100ms) to avoid false transitions during panel interactions
 * where focus briefly leaves the textarea and returns.
 */
export function useMobileEditState(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  isMobile: boolean,
): MobileEditState {
  const [state, setState] = useState<MobileEditState>("viewing");
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFocus = useCallback(() => {
    // Cancel any pending blur transition
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setState("editing");
  }, []);

  const handleBlur = useCallback(() => {
    // Delay viewing transition to allow panel interactions to refocus textarea
    blurTimerRef.current = setTimeout(() => {
      setState("viewing");
      blurTimerRef.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setState("viewing");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Check initial state
    if (document.activeElement === textarea) {
      setState("editing");
    }

    textarea.addEventListener("focus", handleFocus);
    textarea.addEventListener("blur", handleBlur);

    return () => {
      textarea.removeEventListener("focus", handleFocus);
      textarea.removeEventListener("blur", handleBlur);
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, [textareaRef, isMobile, handleFocus, handleBlur]);

  return state;
}

export default useMobileEditState;
