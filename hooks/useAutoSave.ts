import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Document } from "../types";

const CONTENT_KEY = "riso_flow_content";
const DEBOUNCE_MS = 2000;

export interface AutoSaveCounts {
  wordCount: number;
  charCount: number;
}

interface UseAutoSaveReturn {
  lastSavedAt: number;
  isSaving: boolean;
  save: (content: string, documentId?: string | null, counts?: AutoSaveCounts) => void;
  /** Synchronously flush any pending document content/counts to local state. Safe to call from beforeunload. */
  flush: () => void;
}

interface UseAutoSaveOptions {
  /**
   * Sink for document updates. When provided, autosave routes per-document writes here in addition
   * to the localStorage CONTENT_KEY. Without it, only the global slot is written (unattached editor).
   */
  updateDocument?: (id: string, updates: Partial<Document>) => void | Promise<void>;
}

export function useAutoSave(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hold the latest updateDocument in a ref so save() can stay stable across renders.
  const updateRef = useRef<UseAutoSaveOptions["updateDocument"]>(options.updateDocument);
  useEffect(() => {
    updateRef.current = options.updateDocument;
  }, [options.updateDocument]);

  // Track the most recent pending payload so flush() can apply it synchronously.
  const pendingRef = useRef<{
    content: string;
    documentId: string | null;
    counts: AutoSaveCounts | null;
  } | null>(null);

  const save = useCallback((content: string, documentId?: string | null, counts?: AutoSaveCounts) => {
    // Immediate localStorage write (single-source fallback for the unattached editor).
    localStorage.setItem(CONTENT_KEY, content);
    setLastSavedAt(Date.now());

    pendingRef.current = {
      content,
      documentId: documentId ?? null,
      counts: counts ?? null,
    };

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!documentId) return;

    timerRef.current = setTimeout(async () => {
      const payload = pendingRef.current;
      if (!payload || !payload.documentId) return;
      pendingRef.current = null;

      // Local state update via the injected sink — synchronous, single source of truth.
      try {
        const updates: Partial<Document> = { content: payload.content };
        if (payload.counts) {
          updates.wordCount = payload.counts.wordCount;
          updates.charCount = payload.counts.charCount;
        }
        updateRef.current?.(payload.documentId, updates);
      } catch {
        // Swallow — the global localStorage slot still has the data.
      }

      if (!supabase) return;
      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("documents")
          .update({
            content: payload.content,
            ...(payload.counts ? {
              word_count: payload.counts.wordCount,
              char_count: payload.counts.charCount,
            } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.documentId)
          .eq("user_id", user.id);
      } catch {
        // Silently fail — localStorage has the data.
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const flush = useCallback(() => {
    const payload = pendingRef.current;
    if (!payload || !payload.documentId) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
    try {
      const updates: Partial<Document> = { content: payload.content };
      if (payload.counts) {
        updates.wordCount = payload.counts.wordCount;
        updates.charCount = payload.counts.charCount;
      }
      updateRef.current?.(payload.documentId, updates);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Best-effort flush on tab hide/unload so the document row catches the latest content.
  useEffect(() => {
    const handler = () => flush();
    window.addEventListener("beforeunload", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, [flush]);

  return { lastSavedAt, isSaving, save, flush };
}
