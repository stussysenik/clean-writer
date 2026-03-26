import { useEffect, useState, useCallback, useRef } from "react";
import type { HighlighterGeneric, BundledLanguage, BundledTheme } from "shiki";

// Common languages to bundle upfront for instant highlighting
const BUNDLED_LANGUAGES: BundledLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
  "yaml",
  "sql",
  "jsx",
  "tsx",
];

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;

/**
 * Lazy-loads a Shiki highlighter singleton and provides a function to
 * highlight code strings. Languages are loaded on demand.
 */
export function useShikiHighlighter() {
  const [ready, setReady] = useState(false);
  const highlighterRef = useRef<HighlighterGeneric<BundledLanguage, BundledTheme> | null>(null);

  useEffect(() => {
    if (!highlighterPromise) {
      highlighterPromise = import("shiki").then((shiki) =>
        shiki.createHighlighter({
          themes: ["github-light", "github-dark"],
          langs: BUNDLED_LANGUAGES,
        }),
      );
    }

    highlighterPromise.then((h) => {
      highlighterRef.current = h;
      setReady(true);
    });
  }, []);

  /**
   * Returns an array of styled tokens for a code string.
   * Each token has { content, color }.
   */
  const highlightCode = useCallback(
    async (
      code: string,
      lang: string,
      isDark: boolean,
    ): Promise<Array<{ content: string; color: string }>> => {
      const h = highlighterRef.current;
      if (!h) return [{ content: code, color: "" }];

      // Load language on demand if not already loaded
      const loadedLangs = h.getLoadedLanguages();
      if (!loadedLangs.includes(lang as BundledLanguage)) {
        try {
          await h.loadLanguage(lang as BundledLanguage);
        } catch {
          // Unknown language — return plain text
          return [{ content: code, color: "" }];
        }
      }

      const theme = isDark ? "github-dark" : "github-light";
      const result = h.codeToTokens(code, { lang: lang as BundledLanguage, theme });

      // Flatten tokens from all lines
      const tokens: Array<{ content: string; color: string }> = [];
      for (let i = 0; i < result.tokens.length; i++) {
        if (i > 0) tokens.push({ content: "\n", color: "" });
        for (const token of result.tokens[i]) {
          tokens.push({ content: token.content, color: token.color || "" });
        }
      }

      return tokens;
    },
    [],
  );

  return { ready, highlightCode };
}
