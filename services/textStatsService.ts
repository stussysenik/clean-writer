import type { TextStats, CursorStats } from "../types";
import { countWords } from "./localSyntaxService";
import {
  getSentenceBoundaries,
  getParagraphBoundaries,
} from "../utils/textSegmentation";

/**
 * Count grapheme clusters in a string.
 * Uses Intl.Segmenter for accurate grapheme counting (handles emoji, CJK,
 * combining diacritics), falls back to .length for older environments.
 */
export function countChars(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      let count = 0;
      for (const _ of segmenter.segment(text)) {
        count++;
      }
      return count;
    } catch {
      // Fall through to .length
    }
  }
  return text.length;
}

/**
 * CJK character detection regex (same ranges as countWords in localSyntaxService).
 * Matches Chinese, Japanese Kanji/Kana, Korean Hangul.
 */
const CJK_PATTERN =
  /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF]/g;

/**
 * Compute the ratio of CJK characters to total characters (0..1).
 * Used to interpolate reading speed between English WPM and CJK CPM.
 */
function getCjkRatio(text: string): number {
  if (!text) return 0;
  const cjkMatches = text.match(CJK_PATTERN);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  const totalChars = countChars(text);
  if (totalChars === 0) return 0;
  return cjkCount / totalChars;
}

/**
 * Estimate reading time in milliseconds.
 * Interpolates between 200 WPM (English, cjkRatio=0) and 400 CPM
 * (Chinese, cjkRatio=1) based on the CJK character ratio.
 *
 * @param wordCount  - Number of words in the text
 * @param charCount  - Number of grapheme clusters
 * @param cjkRatio   - Fraction of CJK characters (0..1)
 * @returns Estimated reading time in milliseconds
 */
export function getReadingTime(
  wordCount: number,
  charCount: number,
  cjkRatio: number,
): number {
  // English reading: 200 words per minute
  const englishMs = (wordCount / 200) * 60_000;
  // CJK reading: 400 characters per minute
  const cjkMs = (charCount / 400) * 60_000;
  // Interpolate based on CJK content ratio
  return Math.round(englishMs * (1 - cjkRatio) + cjkMs * cjkRatio);
}

/**
 * Compute full text statistics for any text slice.
 * Reuses existing segmentation utilities for sentences, paragraphs, and words.
 */
export function getStatsForText(text: string): TextStats {
  if (!text) {
    return { chars: 0, words: 0, sentences: 0, paragraphs: 0, readingTimeMs: 0 };
  }

  const chars = countChars(text);
  const words = countWords(text);
  const sentences = getSentenceBoundaries(text).length;
  // Filter out empty paragraphs (whitespace-only)
  const paragraphs = getParagraphBoundaries(text).filter(
    (p) => text.slice(p.start, p.end).trim().length > 0,
  ).length;
  const cjkRatio = getCjkRatio(text);
  const readingTimeMs = getReadingTime(words, chars, cjkRatio);

  return { chars, words, sentences, paragraphs, readingTimeMs };
}

/**
 * Find which sentence and paragraph the cursor currently sits in,
 * and return stats for each scope (sentence, paragraph, document).
 * Optionally includes stats for a text selection.
 */
export function getStatsAtCursor(
  content: string,
  cursorPos: number,
  selStart?: number,
  selEnd?: number,
): CursorStats {
  const documentStats = getStatsForText(content);

  // Find the sentence containing the cursor
  const sentenceBounds = getSentenceBoundaries(content);
  const sentenceRange = sentenceBounds.find(
    (r) => cursorPos >= r.start && cursorPos <= r.end,
  ) ?? sentenceBounds[sentenceBounds.length - 1] ?? { start: 0, end: content.length };
  const sentenceText = content.slice(sentenceRange.start, sentenceRange.end);
  const sentenceStats = getStatsForText(sentenceText);

  // Find the paragraph containing the cursor
  const paragraphBounds = getParagraphBoundaries(content);
  const paragraphRange = paragraphBounds.find(
    (r) => cursorPos >= r.start && cursorPos <= r.end,
  ) ?? paragraphBounds[paragraphBounds.length - 1] ?? { start: 0, end: content.length };
  const paragraphText = content.slice(paragraphRange.start, paragraphRange.end);
  const paragraphStats = getStatsForText(paragraphText);

  // Optional selection stats
  let selection: TextStats | undefined;
  if (selStart !== undefined && selEnd !== undefined && selStart !== selEnd) {
    const selText = content.slice(
      Math.min(selStart, selEnd),
      Math.max(selStart, selEnd),
    );
    selection = getStatsForText(selText);
  }

  return {
    sentence: sentenceStats,
    paragraph: paragraphStats,
    document: documentStats,
    selection,
    lastEditedAt: Date.now(),
  };
}

/**
 * Compute stats for each paragraph in the document.
 * Useful for per-paragraph breakdowns in the panel.
 */
export function getPerParagraphStats(content: string): TextStats[] {
  if (!content) return [];
  const paragraphBounds = getParagraphBoundaries(content);
  return paragraphBounds
    .map((p) => getStatsForText(content.slice(p.start, p.end)))
    .filter((s) => s.chars > 0);
}
