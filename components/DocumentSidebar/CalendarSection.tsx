import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { JournalEntry } from "../../types";

interface CalendarSectionProps {
  entries: JournalEntry[];
  activeDocumentId: string | null;
  onSelectEntry: (id: string) => void;
  onCreateEntryForDate: (date: string) => Promise<JournalEntry | null> | JournalEntry | null;
  textColor: string;
  accentColor: string;
}

const VIEW_MONTH_KEY = "clean_writer_calendar_view_month";
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Returns the first day of the month for a given date. */
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Returns the YYYY-MM-DD key for a date in local time. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Build a 42-cell grid (6 rows × 7 cols) starting from the Monday on/before the 1st of `viewMonth`. */
function buildGrid(viewMonth: Date): Date[] {
  const first = startOfMonth(viewMonth);
  // JS Sunday=0; we want Monday=0 so shift.
  const dow = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - dow);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function loadPersistedMonth(): Date {
  try {
    const raw = localStorage.getItem(VIEW_MONTH_KEY);
    if (raw) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) return startOfMonth(parsed);
    }
  } catch {
    // ignore
  }
  return startOfMonth(new Date());
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  entries,
  activeDocumentId,
  onSelectEntry,
  onCreateEntryForDate,
  textColor,
  accentColor,
}) => {
  const [viewMonth, setViewMonth] = useState<Date>(() => loadPersistedMonth());
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MONTH_KEY, viewMonth.toISOString());
    } catch {
      // ignore
    }
  }, [viewMonth]);

  // Index entries by YYYY-MM-DD for O(1) lookup per cell.
  const entryByDate = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    for (const e of entries) {
      // entryDate may be a full ISO string or a YYYY-MM-DD already.
      const key = ymd(new Date(e.entryDate));
      // Most-recent wins on collision.
      const existing = map.get(key);
      if (!existing || new Date(e.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        map.set(key, e);
      }
    }
    return map;
  }, [entries]);

  const grid = useMemo(() => buildGrid(viewMonth), [viewMonth]);
  const todayKey = useMemo(() => ymd(new Date()), []);
  const todayTime = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  const goPrev = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);
  const goNext = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);
  const goToday = useCallback(() => {
    setViewMonth(startOfMonth(new Date()));
  }, []);

  const monthLabel = viewMonth.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const handleCellClick = async (cell: Date) => {
    const key = ymd(cell);
    const cellTime = new Date(cell);
    cellTime.setHours(0, 0, 0, 0);
    if (cellTime.getTime() > todayTime) {
      // Future cells are non-interactive.
      return;
    }
    const existing = entryByDate.get(key);
    if (existing) {
      onSelectEntry(existing.id);
      return;
    }
    if (pendingDate) return;
    setPendingDate(key);
    try {
      const created = await onCreateEntryForDate(key);
      if (created) onSelectEntry(created.id);
    } finally {
      setPendingDate(null);
    }
  };

  return (
    <div className="px-3 pt-4 pb-3" data-testid="calendar-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: textColor, opacity: 0.4 }}
        >
          Calendar
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="p-1 rounded hover:bg-white/5 transition"
            style={{ color: textColor, opacity: 0.6 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToday}
            aria-label="Today"
            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded hover:bg-white/5 transition"
            style={{ color: accentColor, opacity: 0.85 }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="p-1 rounded hover:bg-white/5 transition"
            style={{ color: textColor, opacity: 0.6 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-[11px] font-medium mb-2" style={{ color: textColor, opacity: 0.7 }}>
        {monthLabel}
      </p>

      {/* Weekday header row */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-[9px] uppercase tracking-wider text-center"
            style={{ color: textColor, opacity: 0.35 }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Calendar for ${monthLabel}`}>
        {grid.map((cell) => {
          const key = ymd(cell);
          const inMonth = cell.getMonth() === viewMonth.getMonth();
          const cellTime = new Date(cell);
          cellTime.setHours(0, 0, 0, 0);
          const isFuture = cellTime.getTime() > todayTime;
          const isToday = key === todayKey;
          const entry = entryByDate.get(key);
          const isActive = entry?.id === activeDocumentId;
          const isPending = pendingDate === key;

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              data-testid={`calendar-cell-${key}`}
              data-has-entry={entry ? "true" : "false"}
              data-is-today={isToday ? "true" : "false"}
              aria-disabled={isFuture}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${cell.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}${entry ? " — has entry" : ""}${isToday ? " — today" : ""}`}
              onClick={() => handleCellClick(cell)}
              disabled={isFuture || isPending}
              className="relative h-7 text-[10px] tabular-nums rounded transition-colors duration-100 disabled:cursor-not-allowed"
              style={{
                color: textColor,
                backgroundColor: isActive
                  ? `${accentColor}40`
                  : entry
                    ? `${accentColor}1A`
                    : "transparent",
                opacity: isFuture ? 0.2 : inMonth ? 1 : 0.3,
                border: isToday
                  ? `1px solid ${accentColor}`
                  : `1px solid transparent`,
              }}
            >
              <span style={{ fontWeight: entry ? 600 : 400 }}>
                {cell.getDate()}
              </span>
              {entry && (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSection;
