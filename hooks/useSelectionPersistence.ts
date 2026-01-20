import { useCallback, useRef } from 'react';

interface SavedSelection {
  start: number;
  end: number;
  timestamp: number;
}

interface SelectionPersistence {
  saveSelection: () => void;
  getSavedSelection: () => { start: number; end: number } | null;
  clearSelection: () => void;
}

const SELECTION_TIMEOUT_MS = 5000;

/**
 * Hook for persisting text selection across mobile focus loss.
 *
 * On mobile devices, tapping a button causes the textarea to lose focus
 * before the click handler fires, which clears the selection.
 *
 * This hook saves the selection on pointerdown/touchstart events
 * so it can be retrieved in click handlers.
 *
 * @param textareaRef - Ref to the textarea element
 * @returns { saveSelection, getSavedSelection, clearSelection }
 */
export function useSelectionPersistence(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
): SelectionPersistence {
  const savedSelection = useRef<SavedSelection | null>(null);

  const saveSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Only save if there's an actual selection (not just cursor)
    if (start !== end) {
      savedSelection.current = {
        start,
        end,
        timestamp: Date.now(),
      };
    }
  }, [textareaRef]);

  const getSavedSelection = useCallback(() => {
    const saved = savedSelection.current;
    if (!saved) return null;

    // Check if selection is still valid (within timeout)
    const age = Date.now() - saved.timestamp;
    if (age > SELECTION_TIMEOUT_MS) {
      savedSelection.current = null;
      return null;
    }

    return { start: saved.start, end: saved.end };
  }, []);

  const clearSelection = useCallback(() => {
    savedSelection.current = null;
  }, []);

  return {
    saveSelection,
    getSavedSelection,
    clearSelection,
  };
}

export default useSelectionPersistence;
