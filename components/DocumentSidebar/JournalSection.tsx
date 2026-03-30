import React from "react";
import { JournalEntry } from "../../types";

interface JournalSectionProps {
  entries: JournalEntry[];
  onSelectEntry: (id: string) => void;
  onCreateEntry: () => void;
  activeDocumentId: string | null;
  textColor: string;
  accentColor: string;
}

/**
 * Checks if a date string represents today's date.
 */
function isToday(dateStr: string): boolean {
  const entry = new Date(dateStr);
  const now = new Date();
  return (
    entry.getFullYear() === now.getFullYear() &&
    entry.getMonth() === now.getMonth() &&
    entry.getDate() === now.getDate()
  );
}

/**
 * Formats a journal entry date for display.
 * Today gets a special label; everything else shows "Mon, Mar 28" style.
 */
function formatEntryDate(dateStr: string): string {
  if (isToday(dateStr)) return "Today";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns the first ~50 characters of content as a preview, truncated with ellipsis.
 */
function getPreview(content: string): string {
  const clean = content.replace(/\n/g, " ").trim();
  if (clean.length <= 50) return clean;
  return clean.slice(0, 50).trimEnd() + "...";
}

const JournalSection: React.FC<JournalSectionProps> = ({
  entries,
  onSelectEntry,
  onCreateEntry,
  activeDocumentId,
  textColor,
  accentColor,
}) => {
  // Sort entries by date, most recent first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
  );

  // Find today's entry (if it exists) and separate it
  const todayEntry = sorted.find((e) => isToday(e.entryDate));
  const otherEntries = sorted.filter((e) => !isToday(e.entryDate));

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between px-3 pt-4 pb-1">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: textColor, opacity: 0.4 }}
        >
          Journal
        </h3>
        <button
          onClick={onCreateEntry}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
          style={{ color: accentColor, opacity: 0.7 }}
          aria-label="New journal entry"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Today's entry — pinned with special styling */}
      {todayEntry && (
        <button
          onClick={() => onSelectEntry(todayEntry.id)}
          className="w-full text-left mx-2 mb-2 px-3 py-2.5 rounded-lg transition-colors duration-150"
          style={{
            width: "calc(100% - 16px)",
            backgroundColor:
              todayEntry.id === activeDocumentId
                ? `${accentColor}26`
                : `${accentColor}0D`,
            border: `1px solid ${accentColor}20`,
            color: textColor,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: accentColor }}>
              Today
            </span>
            {todayEntry.mood && (
              <span className="text-sm" aria-label={`Mood: ${todayEntry.mood}`}>
                {todayEntry.mood}
              </span>
            )}
            <span
              className="text-[10px] tabular-nums ml-auto"
              style={{ color: textColor, opacity: 0.35 }}
            >
              {todayEntry.wordCount.toLocaleString()}w
            </span>
          </div>
          {todayEntry.content && (
            <p
              className="text-xs truncate"
              style={{ color: textColor, opacity: 0.5 }}
            >
              {getPreview(todayEntry.content)}
            </p>
          )}
        </button>
      )}

      {/* Other entries */}
      {otherEntries.length > 0 ? (
        <div className="space-y-0.5">
          {otherEntries.map((entry) => {
            const isActive = entry.id === activeDocumentId;
            return (
              <button
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className="w-full text-left px-3 py-2 mx-2 rounded-lg transition-colors duration-150"
                style={{
                  width: "calc(100% - 16px)",
                  backgroundColor: isActive ? `${accentColor}26` : "transparent",
                  color: textColor,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ opacity: 0.7 }}>
                    {formatEntryDate(entry.entryDate)}
                  </span>
                  {entry.mood && (
                    <span className="text-xs">{entry.mood}</span>
                  )}
                  <span
                    className="text-[10px] tabular-nums ml-auto"
                    style={{ color: textColor, opacity: 0.3 }}
                  >
                    {entry.wordCount.toLocaleString()}w
                  </span>
                </div>
                {entry.content && (
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: textColor, opacity: 0.4 }}
                  >
                    {getPreview(entry.content)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        !todayEntry && (
          <div className="px-4 py-4 text-center">
            <p className="text-xs" style={{ color: textColor, opacity: 0.3 }}>
              No journal entries yet
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: textColor, opacity: 0.2 }}>
              Start today's entry
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default JournalSection;
