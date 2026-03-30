import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CONTENT_KEY = "riso_flow_content";
const DEBOUNCE_MS = 2000;

interface UseAutoSaveReturn {
  lastSavedAt: number;
  isSaving: boolean;
  save: (content: string, documentId?: string) => void;
}

export function useAutoSave(): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((content: string, documentId?: string) => {
    // Immediate localStorage write
    localStorage.setItem(CONTENT_KEY, content);
    setLastSavedAt(Date.now());

    // Debounced Supabase write
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!supabase || !documentId) return;

    timerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("documents")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId)
          .eq("user_id", user.id);
      } catch {
        // Silently fail — localStorage has the data
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { lastSavedAt, isSaving, save };
}
