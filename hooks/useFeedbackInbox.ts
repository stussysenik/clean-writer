import { useCallback, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  FeedbackContext,
  FeedbackKind,
  FeedbackNote,
  FeedbackSyncStatus,
} from "../types";

const FEEDBACK_NOTES_KEY = "clean_writer_feedback_notes";
const MAX_STORED_NOTES = 12;

interface SubmitFeedbackInput {
  kind: FeedbackKind;
  note: string;
  contactEmail?: string;
  wantsReply: boolean;
  context: FeedbackContext;
}

interface UseFeedbackInboxReturn {
  notes: FeedbackNote[];
  isSaving: boolean;
  hasRemoteSync: boolean;
  saveMessage: string | null;
  submitFeedback: (input: SubmitFeedbackInput) => Promise<FeedbackNote | null>;
  clearSaveMessage: () => void;
}

function loadLocalNotes(): FeedbackNote[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_NOTES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackNote[]) : [];
  } catch {
    return [];
  }
}

function persistLocalNotes(notes: FeedbackNote[]) {
  localStorage.setItem(
    FEEDBACK_NOTES_KEY,
    JSON.stringify(notes.slice(0, MAX_STORED_NOTES)),
  );
}

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function useFeedbackInbox(): UseFeedbackInboxReturn {
  const [notes, setNotes] = useState<FeedbackNote[]>(() => loadLocalNotes());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const hasRemoteSync = useMemo(() => Boolean(supabase), []);

  const updateNoteSyncStatus = useCallback(
    (id: string, syncStatus: FeedbackSyncStatus) => {
      setNotes((prev) => {
        const updated = prev.map((note) =>
          note.id === id ? { ...note, syncStatus } : note,
        );
        persistLocalNotes(updated);
        return updated;
      });
    },
    [],
  );

  const submitFeedback = useCallback(
    async ({
      kind,
      note,
      contactEmail,
      wantsReply,
      context,
    }: SubmitFeedbackInput): Promise<FeedbackNote | null> => {
      const trimmedNote = note.trim();
      const trimmedEmail = contactEmail?.trim();

      if (trimmedNote.length < 3) {
        setSaveMessage("Write a slightly longer note so it is actionable.");
        return null;
      }

      const feedbackNote: FeedbackNote = {
        id: createId(),
        kind,
        note: trimmedNote,
        contactEmail: trimmedEmail || undefined,
        wantsReply: wantsReply && Boolean(trimmedEmail),
        source: "sidebar",
        syncStatus: hasRemoteSync ? "pending" : "local",
        context,
        createdAt: now(),
      };

      setNotes((prev) => {
        const updated = [feedbackNote, ...prev].slice(0, MAX_STORED_NOTES);
        persistLocalNotes(updated);
        return updated;
      });

      if (!supabase) {
        setSaveMessage("Saved on this device.");
        return feedbackNote;
      }

      setIsSaving(true);

      const { error } = await supabase.from("feedback_notes").insert({
        id: feedbackNote.id,
        kind: feedbackNote.kind,
        note: feedbackNote.note,
        contact_email: feedbackNote.contactEmail ?? null,
        wants_reply: feedbackNote.wantsReply,
        source: feedbackNote.source,
        context: feedbackNote.context,
      });

      setIsSaving(false);

      if (error) {
        updateNoteSyncStatus(feedbackNote.id, "failed");
        setSaveMessage("Saved locally. Remote sync is unavailable right now.");
        return feedbackNote;
      }

      updateNoteSyncStatus(feedbackNote.id, "synced");
      setSaveMessage("Saved and synced.");
      return feedbackNote;
    },
    [hasRemoteSync, updateNoteSyncStatus],
  );

  const clearSaveMessage = useCallback(() => {
    setSaveMessage(null);
  }, []);

  return {
    notes,
    isSaving,
    hasRemoteSync,
    saveMessage,
    submitFeedback,
    clearSaveMessage,
  };
}
