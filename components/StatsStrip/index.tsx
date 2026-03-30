import React, { useMemo } from "react";
import type { CountingConfig } from "../../types";
import { getStatsAtCursor } from "../../services/textStatsService";

interface StatsStripProps {
  content: string;
  cursorPos: number;
  selectionStart?: number;
  selectionEnd?: number;
  countingConfig: CountingConfig;
  textColor: string;
  bgColor: string;
}

/**
 * Minimal stats strip — shows character counts for the current sentence,
 * paragraph, and selection. Clean single line, toggleable via countingConfig.
 *
 * Examples:
 *   sentence 42c · paragraph 187c
 *   sel 23c · sentence 42c · paragraph 187c
 */
const StatsStrip: React.FC<StatsStripProps> = ({
  content,
  cursorPos,
  selectionStart,
  selectionEnd,
  countingConfig,
  textColor,
  bgColor,
}) => {
  const hasSelection =
    selectionStart !== undefined &&
    selectionEnd !== undefined &&
    selectionStart !== selectionEnd;

  const stats = useMemo(
    () => getStatsAtCursor(content, cursorPos, selectionStart, selectionEnd),
    [content, cursorPos, selectionStart, selectionEnd],
  );

  // Nothing to show if all toggles are off
  if (!countingConfig.showSentence && !countingConfig.showParagraph && !countingConfig.showTotal) {
    return null;
  }

  const labelColor = `${textColor}55`;
  const valueColor = `${textColor}88`;
  const sepColor = `${textColor}22`;

  const items: { label: string; value: string }[] = [];

  // Selection always shows when active
  if (hasSelection && stats.selection) {
    items.push({ label: "sel", value: `${stats.selection.chars}c` });
  }

  if (countingConfig.showSentence) {
    items.push({ label: "sentence", value: `${stats.sentence.chars}c` });
  }

  if (countingConfig.showParagraph) {
    items.push({ label: "paragraph", value: `${stats.paragraph.chars}c` });
  }

  if (countingConfig.showTotal) {
    items.push({ label: "total", value: `${stats.document.chars.toLocaleString()}c` });
  }

  return (
    <div
      style={{
        color: textColor,
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        fontSize: "10px",
        lineHeight: "1",
        padding: "5px 16px",
        display: "flex",
        alignItems: "center",
        gap: "0",
        userSelect: "none",
        WebkitUserSelect: "none",
        opacity: 0.9,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && (
            <span style={{ color: sepColor, margin: "0 8px" }}>·</span>
          )}
          <span style={{ color: labelColor }}>{item.label}</span>
          <span style={{ color: valueColor, marginLeft: "4px", fontVariantNumeric: "tabular-nums" }}>
            {item.value}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StatsStrip;
