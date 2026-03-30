import { useState, useEffect } from "react";

/**
 * Format a timestamp as a human-readable relative time string.
 * - < 10s: "just now"
 * - < 60s: "Xs ago"
 * - < 60m: "Xm ago"
 * - < 24h: "Xh ago"
 * - < 48h: "yesterday"
 * - older: "Mar 28" (short month + day)
 */
function formatRelative(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 10_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return "yesterday";

  const date = new Date(timestamp);
  const month = date.toLocaleString("en", { month: "short" });
  return `${month} ${date.getDate()}`;
}

/**
 * React hook that returns a live relative-time string for a given timestamp.
 * Re-renders every 10s for recent timestamps (< 1 minute), every 60s for older.
 * Cleans up intervals on unmount or when the timestamp changes.
 */
export function useRelativeTime(timestamp: number): string {
  const [display, setDisplay] = useState(() => formatRelative(timestamp));

  useEffect(() => {
    // Immediately update on timestamp change
    setDisplay(formatRelative(timestamp));

    const tick = () => {
      setDisplay(formatRelative(timestamp));
    };

    // Choose interval based on how old the timestamp is
    const age = Date.now() - timestamp;
    const intervalMs = age < 60_000 ? 10_000 : 60_000;

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [timestamp]);

  return display;
}
