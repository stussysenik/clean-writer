import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFeedbackInbox } from "../../hooks/useFeedbackInbox";
import type { FeedbackKind, FeedbackNote } from "../../types";

interface FeedbackSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  textColor: string;
  accentColor: string;
  themeId: string;
  wordCount: number;
  charCount: number;
  activeDocumentId: string | null;
}

const KIND_OPTIONS: Array<{
  value: FeedbackKind;
  label: string;
  prompt: string;
}> = [
  {
    value: "wish",
    label: "I want",
    prompt: "What do you want to feel faster, clearer, or easier?",
  },
  {
    value: "friction",
    label: "I got stuck",
    prompt: "What slowed you down or made the interface harder to read?",
  },
  {
    value: "bug",
    label: "Something broke",
    prompt: "Describe what overlapped, disappeared, or behaved unexpectedly.",
  },
  {
    value: "delight",
    label: "This felt good",
    prompt: "What should stay exactly this calm and clear?",
  },
] as const;

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const deltaMs = Date.now() - date.getTime();
  const deltaMinutes = Math.round(deltaMs / 60000);

  if (deltaMinutes < 1) return "Just now";
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function syncStatusLabel(note: FeedbackNote): string {
  switch (note.syncStatus) {
    case "synced":
      return "Synced";
    case "failed":
      return "Local only";
    case "pending":
      return "Syncing";
    default:
      return "Saved here";
  }
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  isExpanded,
  onToggle,
  textColor,
  accentColor,
  themeId,
  wordCount,
  charCount,
  activeDocumentId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [kind, setKind] = useState<FeedbackKind>("wish");
  const [note, setNote] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const {
    notes,
    isSaving,
    hasRemoteSync,
    saveMessage,
    submitFeedback,
    clearSaveMessage,
  } = useFeedbackInbox();

  useEffect(() => {
    if (!isExpanded) return;
    textareaRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => {
      clearSaveMessage();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [clearSaveMessage, saveMessage]);

  const placeholder = useMemo(
    () =>
      KIND_OPTIONS.find((option) => option.value === kind)?.prompt ??
      KIND_OPTIONS[0].prompt,
    [kind],
  );

  const recentNotes = useMemo(() => notes.slice(0, 3), [notes]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const created = await submitFeedback({
      kind,
      note,
      contactEmail,
      wantsReply: Boolean(contactEmail.trim()),
      context: {
        documentId: activeDocumentId,
        themeId,
        wordCount,
        charCount,
        viewportWidth:
          typeof window !== "undefined" ? window.innerWidth : undefined,
        viewportHeight:
          typeof window !== "undefined" ? window.innerHeight : undefined,
      },
    });

    if (created) {
      setNote("");
      setContactEmail("");
      setKind("wish");
    }
  };

  return (
    <section className="px-2 pt-3" data-testid="sidebar-feedback-section">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: `${textColor}12`,
          backgroundColor: `${textColor}05`,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
          aria-expanded={isExpanded}
          aria-controls="sidebar-feedback-panel"
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: accentColor }}
            >
              Notes
            </p>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: textColor, opacity: 0.62 }}
            >
              Tell us what you want, what wasted time, or what should stay.
            </p>
          </div>
          <span
            className="text-[11px] uppercase tracking-[0.2em] flex-shrink-0"
            style={{ color: textColor, opacity: 0.42 }}
          >
            {recentNotes.length > 0 ? `${recentNotes.length} saved` : "Open"}
          </span>
        </button>

        {isExpanded && (
          <div id="sidebar-feedback-panel" className="px-4 pb-4">
            <form
              className="space-y-3"
              onSubmit={handleSubmit}
              data-testid="feedback-form"
            >
              <div className="grid grid-cols-2 gap-2">
                {KIND_OPTIONS.map((option) => {
                  const isActive = kind === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setKind(option.value)}
                      className="rounded-xl px-3 py-2.5 text-left transition-colors"
                      style={{
                        color: isActive ? accentColor : textColor,
                        backgroundColor: isActive
                          ? `${accentColor}14`
                          : `${textColor}06`,
                        border: `1px solid ${
                          isActive ? `${accentColor}32` : `${textColor}10`
                        }`,
                      }}
                      aria-pressed={isActive}
                    >
                      <span className="block text-[11px] font-medium">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="feedback-note"
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
                  style={{ color: textColor, opacity: 0.38 }}
                >
                  Your note
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full min-h-[112px] rounded-2xl px-3 py-3 text-[13px] leading-relaxed resize-none outline-none"
                  style={{
                    color: textColor,
                    backgroundColor: `${textColor}06`,
                    border: `1px solid ${textColor}10`,
                  }}
                  placeholder={placeholder}
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
                  style={{ color: textColor, opacity: 0.38 }}
                >
                  Reply email
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none"
                  style={{
                    color: textColor,
                    backgroundColor: `${textColor}06`,
                    border: `1px solid ${textColor}10`,
                  }}
                  placeholder="Optional. Add it only if you want a reply."
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: textColor, opacity: 0.48 }}
                >
                  {hasRemoteSync
                    ? "Saved here first, then synced when possible."
                    : "Saved locally so you never lose the note."}
                </p>
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity"
                  style={{
                    color: accentColor,
                    backgroundColor: `${accentColor}16`,
                    border: `1px solid ${accentColor}28`,
                    opacity: note.trim().length >= 3 && !isSaving ? 1 : 0.45,
                  }}
                  disabled={note.trim().length < 3 || isSaving}
                >
                  {isSaving ? "Saving" : "Save note"}
                </button>
              </div>

              <div aria-live="polite" className="min-h-[18px]">
                {saveMessage && (
                  <p
                    className="text-[11px]"
                    style={{ color: accentColor, opacity: 0.9 }}
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            </form>

            {recentNotes.length > 0 && (
              <div className="mt-4">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
                  style={{ color: textColor, opacity: 0.34 }}
                >
                  Recent notes
                </p>
                <div className="space-y-2">
                  {recentNotes.map((savedNote) => (
                    <div
                      key={savedNote.id}
                      className="rounded-xl border px-3 py-3"
                      style={{
                        borderColor: `${textColor}10`,
                        backgroundColor: `${textColor}04`,
                      }}
                    >
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                        <span style={{ color: accentColor }}>
                          {
                            KIND_OPTIONS.find(
                              (option) => option.value === savedNote.kind,
                            )?.label
                          }
                        </span>
                        <span style={{ color: textColor, opacity: 0.35 }}>
                          {syncStatusLabel(savedNote)}
                        </span>
                        <span
                          className="ml-auto"
                          style={{ color: textColor, opacity: 0.3 }}
                        >
                          {formatTimestamp(savedNote.createdAt)}
                        </span>
                      </div>
                      <p
                        className="text-[12px] leading-relaxed mt-2"
                        style={{ color: textColor, opacity: 0.7 }}
                      >
                        {savedNote.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackSection;
