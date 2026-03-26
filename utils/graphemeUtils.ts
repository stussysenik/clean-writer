/**
 * Grapheme-aware cursor utilities.
 *
 * JavaScript strings count UTF-16 code units, but visual characters
 * (grapheme clusters) can span multiple code units:
 *   - 💎 (U+1F48E) = 2 code units, 1 grapheme
 *   - 👨‍👩‍👧 = 8 code units, 1 grapheme
 *   - 🏳️‍🌈 = 6 code units, 1 grapheme
 *
 * These utilities bridge the gap between UTF-16 indices (used by
 * textarea.selectionStart) and visual character positions.
 */

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Count visual characters (grapheme clusters) in a string */
export function graphemeLength(text: string): number {
  let count = 0;
  for (const _ of segmenter.segment(text)) {
    count++;
  }
  return count;
}

/** Count graphemes up to a UTF-16 code unit index */
export function graphemeCountUpTo(text: string, codeUnitIndex: number): number {
  const slice = text.slice(0, codeUnitIndex);
  return graphemeLength(slice);
}

/** Convert a grapheme index to a UTF-16 code unit index */
export function graphemeToCodeUnit(
  text: string,
  graphemeIndex: number,
): number {
  let count = 0;
  for (const { index, segment } of segmenter.segment(text)) {
    if (count === graphemeIndex) return index;
    count++;
  }
  return text.length;
}

/**
 * Get the current line text and column at a given cursor position,
 * accounting for soft wrapping in a textarea.
 *
 * Uses a mirror div technique: clones the textarea's font/size/padding
 * into a hidden div, inserts a marker at the cursor position, and reads
 * the marker's offsetTop to determine the visual line.
 */
export function getCursorMetrics(
  textarea: HTMLTextAreaElement,
): {
  /** 0-based visual line index (accounts for word wrap) */
  line: number;
  /** Pixel Y offset of cursor line from top of text content */
  cursorY: number;
  /** Text content of the current visual line */
  lineText: string;
  /** Width in px of text on the current line up to cursor */
  cursorXInLine: number;
} {
  const pos = textarea.selectionStart;
  const text = textarea.value;
  const computed = getComputedStyle(textarea);

  // Create mirror div
  const mirror = document.createElement("div");
  mirror.style.cssText = `
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: ${textarea.clientWidth}px;
    font-family: ${computed.fontFamily};
    font-size: ${computed.fontSize};
    line-height: ${computed.lineHeight};
    letter-spacing: ${computed.letterSpacing};
    padding-left: ${computed.paddingLeft};
    padding-right: ${computed.paddingRight};
    padding-top: 0;
    border: none;
    box-sizing: border-box;
  `;

  // Text before cursor
  const beforeCursor = document.createTextNode(text.slice(0, pos));
  // Marker span at cursor position
  const marker = document.createElement("span");
  marker.textContent = "\u200b"; // zero-width space
  marker.style.display = "inline";
  // Text after cursor
  const afterCursor = document.createTextNode(text.slice(pos));

  mirror.appendChild(beforeCursor);
  mirror.appendChild(marker);
  mirror.appendChild(afterCursor);
  document.body.appendChild(mirror);

  const markerTop = marker.offsetTop;
  const markerLeft = marker.offsetLeft;
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.625;
  const line = Math.round(markerTop / lineHeight);

  // Get the current visual line's text by finding line boundaries
  // Walk backward from cursor to find line start (where offsetTop changes)
  let lineStartIndex = pos;
  const testSpan = document.createElement("span");
  testSpan.textContent = "\u200b";

  // Simple approach: use the line number and lineHeight
  const cursorY = markerTop;
  const cursorXInLine = markerLeft - parseFloat(computed.paddingLeft);

  // Get approximate line text
  const lines = text.split("\n");
  let charCount = 0;
  let lineText = "";
  for (const l of lines) {
    if (charCount + l.length >= pos) {
      lineText = l;
      break;
    }
    charCount += l.length + 1; // +1 for \n
  }

  document.body.removeChild(mirror);

  return { line, cursorY, lineText, cursorXInLine };
}

/**
 * Measure the pixel width of a string using a canvas context.
 * Much faster than DOM-based measurement for repeated calls.
 */
let measureCanvas: HTMLCanvasElement | null = null;

export function measureTextWidth(
  text: string,
  font: string,
  letterSpacing?: string,
): number {
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const ctx = measureCanvas.getContext("2d")!;
  ctx.font = font;

  // Canvas doesn't support letter-spacing directly;
  // approximate by adding spacing * char count
  let width = ctx.measureText(text).width;
  if (letterSpacing) {
    const spacing = parseFloat(letterSpacing);
    if (!isNaN(spacing) && spacing !== 0) {
      width += spacing * graphemeLength(text);
    }
  }
  return width;
}
