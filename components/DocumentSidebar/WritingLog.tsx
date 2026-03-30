import React from "react";
import { WritingSession, JournalEntry } from "../../types";

interface WritingLogProps {
  sessions: WritingSession[];
  journalEntries: JournalEntry[];
  textColor: string;
  accentColor: string;
}

/**
 * Count consecutive days (ending today or yesterday) that have a journal entry.
 * A streak means no gaps in daily entries.
 */
function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  // Normalize entry dates to YYYY-MM-DD strings
  const entryDates = new Set(
    entries.map((e) => {
      const d = new Date(e.entryDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }),
  );

  // Start from today and walk backwards
  const today = new Date();
  let streak = 0;
  let current = new Date(today);

  // Check today first, then yesterday, then the day before, etc.
  for (let i = 0; i < 365; i++) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    if (entryDates.has(key)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (i === 0) {
      // If today doesn't have an entry, check if yesterday starts a streak
      current.setDate(current.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the start of the current week (Monday).
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the start of the current month.
 */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Format a duration in seconds into a human-readable string.
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}

/**
 * Format a session date for the recent sessions list.
 */
function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (diffMs < 86400000) {
    // Today
    return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  }
  if (diffMs < 172800000) {
    return "Yesterday";
  }
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

const WritingLog: React.FC<WritingLogProps> = ({
  sessions,
  journalEntries,
  textColor,
  accentColor,
}) => {
  const streak = calculateStreak(journalEntries);
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const wordsThisWeek = sessions
    .filter((s) => new Date(s.startedAt).getTime() >= weekStart.getTime())
    .reduce((sum, s) => sum + s.wordsWritten, 0);

  const wordsThisMonth = sessions
    .filter((s) => new Date(s.startedAt).getTime() >= monthStart.getTime())
    .reduce((sum, s) => sum + s.wordsWritten, 0);

  // Last 5 sessions, sorted most recent first
  const recentSessions = [...sessions]
    .sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      {/* Section header */}
      <div className="px-3 pt-4 pb-2">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: textColor, opacity: 0.4 }}
        >
          Writing Log
        </h3>
      </div>

      {/* Stats row */}
      <div className="px-3 flex items-center gap-4 mb-3">
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">
            {streak > 0 ? "\uD83D\uDD25" : "\u2014"}
          </span>
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: textColor, opacity: streak > 0 ? 0.8 : 0.35 }}
          >
            {streak > 0 ? `${streak} day streak` : "No streak"}
          </span>
        </div>
      </div>

      {/* Words this week / month */}
      <div className="px-3 grid grid-cols-2 gap-2 mb-3">
        <div
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: `${textColor}08` }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-0.5"
            style={{ color: textColor, opacity: 0.35 }}
          >
            This week
          </p>
          <p
            className="text-sm font-semibold tabular-nums"
            style={{ color: accentColor }}
          >
            {wordsThisWeek.toLocaleString()}
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: `${textColor}08` }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-0.5"
            style={{ color: textColor, opacity: 0.35 }}
          >
            This month
          </p>
          <p
            className="text-sm font-semibold tabular-nums"
            style={{ color: accentColor }}
          >
            {wordsThisMonth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 ? (
        <div className="px-3 pb-3">
          <p
            className="text-[10px] uppercase tracking-wider mb-1.5"
            style={{ color: textColor, opacity: 0.3 }}
          >
            Recent sessions
          </p>
          <div className="space-y-1">
            {recentSessions.map((session) => {
              const durationSec =
                session.endedAt
                  ? Math.round(
                      (new Date(session.endedAt).getTime() -
                        new Date(session.startedAt).getTime()) /
                        1000,
                    )
                  : 0;

              return (
                <div
                  key={session.id}
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  <span className="flex-shrink-0 w-16 truncate">
                    {formatSessionDate(session.startedAt)}
                  </span>
                  {durationSec > 0 && (
                    <span className="flex-shrink-0 tabular-nums">
                      {formatDuration(durationSec)}
                    </span>
                  )}
                  <span className="tabular-nums ml-auto flex-shrink-0">
                    {session.wordsWritten.toLocaleString()}w
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 text-center">
          <p className="text-xs" style={{ color: textColor, opacity: 0.25 }}>
            No sessions recorded yet
          </p>
        </div>
      )}
    </div>
  );
};

export default WritingLog;
