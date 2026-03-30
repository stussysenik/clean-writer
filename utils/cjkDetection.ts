/**
 * CJK Detection Utility
 *
 * Provides character-level analysis for detecting CJK (Chinese, Japanese, Korean)
 * content in text. Used to adapt UI behavior — e.g., showing locale-aware notices
 * in the syntax panel and selecting appropriate word-counting strategies.
 *
 * Unicode ranges:
 *  - U+4E00–U+9FFF  CJK Unified Ideographs (Chinese/Japanese Kanji/Korean Hanja)
 *  - U+3400–U+4DBF  CJK Extension A
 *  - U+F900–U+FAFF  CJK Compatibility Ideographs
 *  - U+3040–U+309F  Hiragana
 *  - U+30A0–U+30FF  Katakana
 *  - U+AC00–U+D7AF  Korean Hangul Syllables
 *  - U+1100–U+11FF  Korean Hangul Jamo
 */

/** Matches a single CJK character (Chinese/Japanese Kanji/Korean Hanja + extensions) */
const CJK_IDEOGRAPH = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/;

/** Matches Japanese Hiragana or Katakana */
const JAPANESE_KANA = /[\u3040-\u309F\u30A0-\u30FF]/;

/** Matches Korean Hangul syllables and Jamo */
const KOREAN_HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF]/;

/** Combined CJK test (any of the above) */
const CJK_ANY = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF]/;

/**
 * Count CJK characters in a string (excludes whitespace, digits, and punctuation).
 * Returns { cjk, total } where total is all letter-like characters.
 */
function countCJK(text: string): { cjk: number; total: number } {
  // Strip whitespace, digits, and Unicode punctuation/symbols
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, "");
  let cjk = 0;
  for (const char of letters) {
    if (CJK_ANY.test(char)) {
      cjk++;
    }
  }
  return { cjk, total: letters.length };
}

/**
 * Returns 0–1 ratio of CJK characters in the text.
 * Only letter-like characters are considered (whitespace, digits, punctuation excluded).
 */
export function getCJKRatio(text: string): number {
  const { cjk, total } = countCJK(text);
  if (total === 0) return 0;
  return cjk / total;
}

/**
 * Returns true if more than 30% of the text's letter-like characters are CJK.
 */
export function isCJKDominant(text: string): boolean {
  return getCJKRatio(text) > 0.3;
}

/**
 * Rough locale detection based on character distribution.
 *
 * Decision logic:
 *  1. If <5% CJK → "en"
 *  2. If Korean Hangul dominates CJK portion → "ko"
 *  3. If Japanese kana present → "ja"
 *  4. If CJK ideographs dominate → "zh"
 *  5. Otherwise → "mixed"
 */
export function detectContentLocale(text: string): "en" | "zh" | "ja" | "ko" | "mixed" {
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, "");
  if (letters.length === 0) return "en";

  let cjkIdeographs = 0;
  let japaneseKana = 0;
  let koreanHangul = 0;
  let total = 0;

  for (const char of letters) {
    total++;
    if (CJK_IDEOGRAPH.test(char)) {
      cjkIdeographs++;
    } else if (JAPANESE_KANA.test(char)) {
      japaneseKana++;
    } else if (KOREAN_HANGUL.test(char)) {
      koreanHangul++;
    }
  }

  const cjkTotal = cjkIdeographs + japaneseKana + koreanHangul;
  const cjkRatio = cjkTotal / total;

  // Mostly Latin
  if (cjkRatio < 0.05) return "en";

  // Among CJK characters, which script dominates?
  if (koreanHangul > cjkIdeographs && koreanHangul > japaneseKana) return "ko";
  if (japaneseKana > 0) return "ja"; // Kana is a strong Japanese signal
  if (cjkIdeographs > 0 && cjkRatio > 0.3) return "zh";

  return "mixed";
}
