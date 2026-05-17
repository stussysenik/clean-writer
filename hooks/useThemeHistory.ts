import { useState, useCallback } from "react";

const STORAGE_KEY = "clean_writer_theme_history";
const MAX_HISTORY = 50;

export interface ThemeHistoryEntry {
  themeId: string;
  timestamp: number;
}

interface ThemeHistoryState {
  past: ThemeHistoryEntry[];
  future: ThemeHistoryEntry[];
}

function loadHistory(): ThemeHistoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        Array.isArray(parsed.past) &&
        Array.isArray(parsed.future)
      ) {
        return parsed;
      }
    }
  } catch {}
  return { past: [], future: [] };
}

function saveHistory(state: ThemeHistoryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useThemeHistory(currentThemeId: string) {
  const [state, setState] = useState<ThemeHistoryState>(loadHistory);

  const push = useCallback(
    (themeId: string) => {
      if (themeId === currentThemeId) return;
      setState((prev) => {
        const entry: ThemeHistoryEntry = { themeId, timestamp: Date.now() };
        const past = [
          { themeId: currentThemeId, timestamp: Date.now() },
          ...prev.past,
        ].slice(0, MAX_HISTORY);
        const next = { past, future: [] };
        saveHistory(next);
        return next;
      });
    },
    [currentThemeId],
  );

  const undo = useCallback((): string | null => {
    let undoneId: string | null = null;
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const [last, ...rest] = prev.past;
      const next = {
        past: rest,
        future: [
          { themeId: currentThemeId, timestamp: Date.now() },
          ...prev.future,
        ].slice(0, MAX_HISTORY),
      };
      saveHistory(next);
      undoneId = last.themeId;
      return next;
    });
    return undoneId;
  }, [currentThemeId]);

  const redo = useCallback((): string | null => {
    let redoneId: string | null = null;
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const [next, ...rest] = prev.future;
      const updated = {
        past: [
          { themeId: currentThemeId, timestamp: Date.now() },
          ...prev.past,
        ].slice(0, MAX_HISTORY),
        future: rest,
      };
      saveHistory(updated);
      redoneId = next.themeId;
      return updated;
    });
    return redoneId;
  }, [currentThemeId]);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return { push, undo, redo, canUndo, canRedo };
}
