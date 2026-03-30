import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { RisoTheme, SyntaxSets, HighlightConfig, SongAnalysis, FocusMode, FocusNavState } from "../types";
import { useIMEComposition } from "../hooks/useIMEComposition";
import { useTypewriterScroll } from "../hooks/useTypewriterScroll";
import { useDynamicPadding } from "../hooks/useDynamicPadding";
import {
  isHashtagToken,
  isNumberToken,
  isUrlToken,
  normalizeTokenForSyntaxLookup,
} from "../utils/syntaxPatterns";
import { replaceEmojisWithUTF } from "../utils/emojiUtils";
import { isDarkBackground } from "../utils/colorContrast";
import { countChars } from "../services/textStatsService";
import { countWords } from "../services/localSyntaxService";
import { useShikiHighlighter } from "../hooks/useShikiHighlighter";

interface TypewriterProps {
  content: string;
  setContent: (s: string) => void;
  theme: RisoTheme;
  syntaxSets: SyntaxSets;
  highlightConfig: HighlightConfig;
  fontSize: string;
  maxWidth: number;
  fontFamily: string;
  showUtfEmojiCodes?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  hoveredCategory?: keyof HighlightConfig | null;
  persistedSelection?: { start: number; end: number } | null;
  onRestoreSelection?: () => void;
  songMode?: boolean;
  songData?: SongAnalysis | null;
  rhymeColors?: readonly string[];
  showSyllableAnnotations?: boolean;
  rhymeHighlightRadius?: number;
  rhymeBoldEnabled?: boolean;
  focusedRhymeKey?: string | null;
  hoveredRhymeKey?: string | null;
  disabledRhymeKeys?: Set<string>;
  letterSpacing?: number;
  lineHeight?: number;
  focusMode?: FocusMode;
  focusNavState?: FocusNavState | null;
  isMobile?: boolean;
  onFocusTap?: (index: number) => void;
  codeMode?: boolean;
  codeLanguage?: string;
  unstylizedMode?: boolean;
  showCharCounts?: boolean;
}

// Known non-text keys to reject (control, navigation, function keys).
// Everything else is treated as text input, which correctly handles
// emoji (multi-codepoint), CJK, and other Unicode input.
const NON_TEXT_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
  "PrintScreen",
  "ScrollLock",
  "Pause",
  "CapsLock",
  "NumLock",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "ContextMenu",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "AudioVolumeUp",
  "AudioVolumeDown",
  "AudioVolumeMute",
  "MediaPlayPause",
  "MediaTrackNext",
  "MediaTrackPrevious",
  "MediaStop",
  "Unidentified",
  "Process",
  "Dead",
]);

function isTextInputKey(key: string): boolean {
  return !NON_TEXT_KEYS.has(key);
}

const Typewriter: React.FC<TypewriterProps> = ({
  content,
  setContent,
  theme,
  syntaxSets,
  highlightConfig,
  fontSize,
  maxWidth,
  fontFamily,
  showUtfEmojiCodes = false,
  textareaRef: externalTextareaRef,
  hoveredCategory = null,
  persistedSelection = null,
  onRestoreSelection,
  songMode = false,
  songData = null,
  rhymeColors = [],
  showSyllableAnnotations = false,
  rhymeHighlightRadius = 4,
  rhymeBoldEnabled = true,
  focusedRhymeKey = null,
  hoveredRhymeKey = null,
  disabledRhymeKeys,
  letterSpacing: letterSpacingProp = 0,
  lineHeight: lineHeightProp = 1.6,
  focusMode = "none" as FocusMode,
  focusNavState = null,
  isMobile = false,
  onFocusTap,
  codeMode = false,
  codeLanguage = "javascript",
  unstylizedMode = false,
  showCharCounts = false,
}) => {
  const effectiveLineHeight = songMode && showSyllableAnnotations ? "2.4" : String(lineHeightProp);
  const effectiveLetterSpacing = letterSpacingProp ? `${letterSpacingProp}em` : undefined;

  // Focus mode: use the focusNavState from the hook if available,
  // otherwise fall back to a simple "last unit" dimBeforeIndex for backwards compat
  const focusRange = focusNavState?.focusedRange ?? null;
  const hasFocusNav = focusNavState !== null && focusNavState.mode !== "none" && focusRange !== null;

  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const selectionOverlayRef = useRef<HTMLDivElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Use the external ref if provided, otherwise use internal ref
  const textareaRef = externalTextareaRef || internalTextareaRef;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 0);
  }, [textareaRef]);

  // IME composition handling for Chinese, Japanese, Korean, and other languages
  const {
    isComposing,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
  } = useIMEComposition();

  // Full Typewriter mode: cursor-aware layout
  const { scrollToSweetSpot } = useTypewriterScroll({
    textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>,
    enabled: true,
  });

  // Shiki syntax highlighting for code mode and fenced code blocks
  const { ready: shikiReady, highlightCode } = useShikiHighlighter();

  // Cache for highlighted code blocks to avoid re-highlighting on every render
  const [codeHighlightCache, setCodeHighlightCache] = useState<
    Map<string, Array<{ content: string; color: string }>>
  >(new Map());

  // Highlight code blocks when content or mode changes
  useEffect(() => {
    if (!shikiReady) return;

    const isDark = isDarkBackground(theme.background);

    if (codeMode) {
      // Full code mode — highlight entire content
      const cacheKey = `full:${codeLanguage}:${isDark}:${content}`;
      if (codeHighlightCache.has(cacheKey)) return;

      highlightCode(content, codeLanguage, isDark).then((tokens) => {
        setCodeHighlightCache((prev) => new Map(prev).set(cacheKey, tokens));
      });
      return;
    }

    // Writing mode — find and highlight fenced code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    const promises: Array<{ key: string; promise: Promise<Array<{ content: string; color: string }>> }> = [];

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const lang = match[1] || "text";
      const code = match[2];
      const cacheKey = `block:${lang}:${isDark}:${code}`;
      if (!codeHighlightCache.has(cacheKey)) {
        promises.push({ key: cacheKey, promise: highlightCode(code, lang, isDark) });
      }
    }

    if (promises.length > 0) {
      Promise.all(promises.map((p) => p.promise)).then((results) => {
        setCodeHighlightCache((prev) => {
          const next = new Map(prev);
          results.forEach((tokens, i) => next.set(promises[i].key, tokens));
          return next;
        });
      });
    }
  }, [content, codeMode, codeLanguage, shikiReady, highlightCode, theme.background]);

  const { paddingLeft, paddingRight, recalculatePadding } = useDynamicPadding({
    textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>,
    enabled: true,
    isMobile,
  });

  // Track whether cursor is at the content frontier (end of text)
  const [cursorAtFrontier, setCursorAtFrontier] = useState(true);

  // Update frontier status on selection changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const checkFrontier = () => {
      setCursorAtFrontier(textarea.selectionStart >= content.length);
    };
    textarea.addEventListener("select", checkFrontier);
    textarea.addEventListener("click", checkFrontier);
    textarea.addEventListener("keyup", checkFrontier);
    return () => {
      textarea.removeEventListener("select", checkFrontier);
      textarea.removeEventListener("click", checkFrontier);
      textarea.removeEventListener("keyup", checkFrontier);
    };
  }, [textareaRef, content.length]);

  // Recalculate typewriter layout whenever content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSweetSpot();
      recalculatePadding();
    }, 16);
    return () => clearTimeout(timer);
  }, [content, scrollToSweetSpot, recalculatePadding]);

  // Garfield cursor: Calculate the color for the last word typed
  const lastWordColor = useMemo(() => {
    if (!content) return theme.cursor;

    const rawLastToken = content.trim().split(/\s+/).pop() || "";
    const lastWord = normalizeTokenForSyntaxLookup(rawLastToken);

    if (!lastWord) return theme.cursor;

    // Check which syntax category the last word belongs to (O(1) lookups with Sets)
    if (highlightConfig.articles && syntaxSets.articles.has(lastWord)) {
      return theme.highlight.article;
    }
    if (
      highlightConfig.urls &&
      (syntaxSets.urls.has(lastWord) || isUrlToken(lastWord))
    ) {
      return theme.highlight.url;
    }
    if (
      highlightConfig.hashtags &&
      (syntaxSets.hashtags.has(lastWord) || isHashtagToken(lastWord))
    ) {
      return theme.highlight.hashtag;
    }
    if (
      highlightConfig.numbers &&
      (syntaxSets.numbers.has(lastWord) || isNumberToken(lastWord))
    ) {
      return theme.highlight.number;
    }
    if (
      highlightConfig.interjections &&
      syntaxSets.interjections.has(lastWord)
    ) {
      return theme.highlight.interjection;
    }
    if (highlightConfig.prepositions && syntaxSets.prepositions.has(lastWord)) {
      return theme.highlight.preposition;
    }
    if (highlightConfig.conjunctions && syntaxSets.conjunctions.has(lastWord)) {
      return theme.highlight.conjunction;
    }
    if (highlightConfig.pronouns && syntaxSets.pronouns.has(lastWord)) {
      return theme.highlight.pronoun;
    }
    if (highlightConfig.adverbs && syntaxSets.adverbs.has(lastWord)) {
      return theme.highlight.adverb;
    }
    if (highlightConfig.verbs && syntaxSets.verbs.has(lastWord)) {
      return theme.highlight.verb;
    }
    if (highlightConfig.adjectives && syntaxSets.adjectives.has(lastWord)) {
      return theme.highlight.adjective;
    }
    if (highlightConfig.nouns && syntaxSets.nouns.has(lastWord)) {
      return theme.highlight.noun;
    }

    return theme.cursor;
  }, [content, syntaxSets, highlightConfig, theme]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Skip handling during IME composition (Chinese, Japanese, Korean, etc.)
    if (isComposing) {
      return;
    }

    const textarea = e.currentTarget;

    // 1. Strictly Disable Deletion
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      return;
    }

    // 2. Jump to end: Cmd+↓ (Mac) or Ctrl+End (Windows)
    if (
      (e.key === "ArrowDown" && e.metaKey) ||
      (e.key === "End" && e.ctrlKey)
    ) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = content.length;
      scrollToBottom();
      return;
    }

    // 3. Allow modifiers (for paste, copy, select-all, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 4. Handle character input — insert at cursor position
    if (isTextInputKey(e.key) || e.key === "Enter") {
      e.preventDefault();

      const char = e.key === "Enter" ? "\n" : e.key;

      // Collapse any selection to start (no replacing = no deletion)
      const pos = textarea.selectionStart ?? content.length;
      const newContent = content.slice(0, pos) + char + content.slice(pos);
      setContent(newContent);

      // Restore cursor after React re-render
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + char.length;
      }, 0);
    }
  };

  // Handle IME composition end - insert composed text at cursor position
  const handleCompositionEndWithAppend = (
    e: React.CompositionEvent<HTMLTextAreaElement>,
  ) => {
    const textarea = e.currentTarget;
    handleCompositionEnd(e, (composedText: string) => {
      const pos = textarea.selectionStart ?? content.length;
      // The IME may have already modified textarea.value, so use our content state
      const newContent = content.slice(0, pos) + composedText + content.slice(pos);
      setContent(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + composedText.length;
      }, 0);
    });
  };

  // Fallback for OS emoji pickers (macOS Ctrl+Cmd+Space, Windows Win+.) that
  // insert text via InputEvent without triggering keyDown. We compare the
  // textarea value against `content` to detect OS-injected text and insert it
  // at the correct cursor position.
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const newValue = textarea.value;

      // Reject deletions — only accept if text grew or stayed same
      if (newValue.length < content.length) {
        // Restore content and cursor position
        textarea.value = content;
        return;
      }

      // No change — ignore
      if (newValue === content) return;

      // Accept the new value directly (it has the insertion at the right position)
      setContent(newValue);
    },
    [content, setContent],
  );

  // Handle paste - insert pasted text at cursor position
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = e.currentTarget;
    const pastedText = e.clipboardData.getData("text");
    if (pastedText) {
      const pos = textarea.selectionStart ?? content.length;
      const newContent = content.slice(0, pos) + pastedText + content.slice(pos);
      setContent(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + pastedText.length;
      }, 0);
    }
  };

  const handleScroll = useCallback(() => {
    if (!textareaRef.current) return;

    if (backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }

    if (selectionOverlayRef.current) {
      selectionOverlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const normalizedPersistedSelection = useMemo(() => {
    if (!persistedSelection || showUtfEmojiCodes) return null;

    const start = Math.max(
      0,
      Math.min(content.length, persistedSelection.start),
    );
    const end = Math.max(0, Math.min(content.length, persistedSelection.end));

    if (start >= end) return null;

    return { start, end };
  }, [persistedSelection, content, showUtfEmojiCodes]);

  const showPersistedSelectionOverlay =
    !!normalizedPersistedSelection && !isTextareaFocused;

  const handleMobileFocusClick = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!isMobile || focusMode === "none" || !onFocusTap) return;

      const textarea = e.currentTarget;
      window.requestAnimationFrame(() => {
        const textIndex = textarea.selectionStart ?? content.length;
        onFocusTap(textIndex);
      });
    },
    [content.length, focusMode, isMobile, onFocusTap],
  );

  // Use passive event listener for scroll performance
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("scroll", handleScroll, { passive: true });
      return () => textarea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Ensure frozen selection overlay is aligned when shown after a blur.
  useEffect(() => {
    if (
      !showPersistedSelectionOverlay ||
      !textareaRef.current ||
      !selectionOverlayRef.current
    ) {
      return;
    }
    selectionOverlayRef.current.scrollTop = textareaRef.current.scrollTop;
  }, [showPersistedSelectionOverlay, textareaRef]);

  // Core syntax highlighting renderer — accepts arbitrary text string
  const renderHighlightsForText = useCallback((text: string) => {
    if (!text) return null;

    // First, split content by strikethrough syntax "~~...~~"
    // The regex captures the delimiter and content together.
    const chunks = text.split(/(~~(?:[^~]|~(?!~))+~~)/g);

    return chunks.map((chunk, chunkIndex) => {
      // If it is a strikethrough block
      if (chunk.startsWith("~~") && chunk.endsWith("~~") && chunk.length >= 4) {
        const renderedStrikeChunk = showUtfEmojiCodes
          ? replaceEmojisWithUTF(chunk)
          : chunk;
        return (
          <span
            key={`st-${chunkIndex}`}
            style={{
              textDecoration: "line-through",
              opacity: 0.5,
              textDecorationThickness: "2px",
              textDecorationColor: unstylizedMode ? "#000000" : theme.strikethrough,
              transition: "color 0.3s ease, text-shadow 0.3s ease",
            }}
          >
            {renderedStrikeChunk}
          </span>
        );
      }

      // If it is normal text, process syntax highlighting
      // First split on URLs to preserve them as whole tokens, then tokenize the rest
      const renderedChunk = showUtfEmojiCodes
        ? replaceEmojisWithUTF(chunk)
        : chunk;
      const urlSplitPattern =
        /((?:https?:\/\/)\S+|(?:www\.)\S+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|dev|co|app|ai|edu|gov|me|info|biz)(?:\/\S*)?)/g;
      const urlTestPattern =
        /^(?:https?:\/\/)\S+$|^(?:www\.)\S+$|^(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|dev|co|app|ai|edu|gov|me|info|biz)(?:\/\S*)?$/i;
      const urlSplit = renderedChunk.split(urlSplitPattern);
      // Flatten: for non-URL segments, split on whitespace/punctuation; URL segments stay whole
      const parts: string[] = [];
      for (const segment of urlSplit) {
        if (urlTestPattern.test(segment)) {
          parts.push(segment);
        } else {
          // Tokenize on whitespace and punctuation, preserving contractions
          const subParts = segment.split(
            /(\s+|[.,!?;:"()\-]+|(?<!\w)['']|[''](?!\w))/g,
          );
          parts.push(...subParts);
        }
      }

      return (
        <React.Fragment key={`chunk-${chunkIndex}`}>
          {parts.map((part, index) => {
            const normalizedPart = normalizeTokenForSyntaxLookup(part);
            let color = theme.text;
            let isMatch = false;
            let matchCategory: keyof HighlightConfig | null = null;

            if (!normalizedPart) {
              return (
                <span key={index} style={{ transition: "color 0.3s ease" }}>
                  {part}
                </span>
              );
            }

            // Check highlights based on config — O(1) Set.has() lookups
            // Priority: URLs → hashtags → numbers → NLP categories
            if (
              highlightConfig.urls &&
              (syntaxSets.urls.has(normalizedPart) ||
                isUrlToken(normalizedPart))
            ) {
              color = theme.highlight.url;
              isMatch = true;
              matchCategory = "urls";
            } else if (
              highlightConfig.hashtags &&
              (syntaxSets.hashtags.has(normalizedPart) ||
                isHashtagToken(normalizedPart))
            ) {
              color = theme.highlight.hashtag;
              isMatch = true;
              matchCategory = "hashtags";
            } else if (
              highlightConfig.numbers &&
              (syntaxSets.numbers.has(normalizedPart) ||
                isNumberToken(normalizedPart))
            ) {
              color = theme.highlight.number;
              isMatch = true;
              matchCategory = "numbers";
            } else if (
              highlightConfig.articles &&
              syntaxSets.articles.has(normalizedPart)
            ) {
              color = theme.highlight.article;
              isMatch = true;
              matchCategory = "articles";
            } else if (
              highlightConfig.interjections &&
              syntaxSets.interjections.has(normalizedPart)
            ) {
              color = theme.highlight.interjection;
              isMatch = true;
              matchCategory = "interjections";
            } else if (
              highlightConfig.prepositions &&
              syntaxSets.prepositions.has(normalizedPart)
            ) {
              color = theme.highlight.preposition;
              isMatch = true;
              matchCategory = "prepositions";
            } else if (
              highlightConfig.conjunctions &&
              syntaxSets.conjunctions.has(normalizedPart)
            ) {
              color = theme.highlight.conjunction;
              isMatch = true;
              matchCategory = "conjunctions";
            } else if (
              highlightConfig.pronouns &&
              syntaxSets.pronouns.has(normalizedPart)
            ) {
              color = theme.highlight.pronoun;
              isMatch = true;
              matchCategory = "pronouns";
            } else if (
              highlightConfig.adverbs &&
              syntaxSets.adverbs.has(normalizedPart)
            ) {
              color = theme.highlight.adverb;
              isMatch = true;
              matchCategory = "adverbs";
            } else if (
              highlightConfig.verbs &&
              syntaxSets.verbs.has(normalizedPart)
            ) {
              color = theme.highlight.verb;
              isMatch = true;
              matchCategory = "verbs";
            } else if (
              highlightConfig.adjectives &&
              syntaxSets.adjectives.has(normalizedPart)
            ) {
              color = theme.highlight.adjective;
              isMatch = true;
              matchCategory = "adjectives";
            } else if (
              highlightConfig.nouns &&
              syntaxSets.nouns.has(normalizedPart)
            ) {
              color = theme.highlight.noun;
              isMatch = true;
              matchCategory = "nouns";
            }

            // Check if this word should glow (matching hovered category)
            const shouldGlow =
              hoveredCategory && matchCategory === hoveredCategory;
            const glowColor = shouldGlow ? color : "transparent";

            const style: React.CSSProperties = unstylizedMode
              ? {
                  color: "#000000",
                  fontWeight: "inherit",
                  transition: "color 0.3s ease",
                }
              : {
                  color: isMatch ? color : theme.text,
                  fontWeight: isMatch ? 700 : "inherit",
                  textShadow: shouldGlow
                    ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}80`
                    : theme.id === "blueprint" && isMatch
                      ? `0 0 1px ${color}`
                      : "none",
                  transition:
                    "color 0.3s ease, text-shadow 0.3s ease, font-weight 0.3s ease",
                };

            return (
              <span key={`${chunkIndex}-${index}`} style={style}>
                {part}
              </span>
            );
          })}
        </React.Fragment>
      );
    });
  }, [
    syntaxSets,
    theme,
    highlightConfig,
    hoveredCategory,
    showUtfEmojiCodes,
    unstylizedMode,
  ]);

  // Render Shiki-highlighted tokens as React spans
  const renderCodeTokens = useCallback(
    (tokens: Array<{ content: string; color: string }>) => {
      return tokens.map((token, i) => (
        <span key={i} style={token.color ? { color: token.color } : undefined}>
          {token.content}
        </span>
      ));
    },
    [],
  );

  // Markdown-aware renderer: detects headings, todos, and fenced code blocks
  // Wraps lines with special styling while delegating regular text to renderHighlightsForText
  const renderContentWithMarkdown = useCallback(
    (text: string) => {
      if (!text) return null;

      // First, split by fenced code blocks
      const codeBlockRegex = /(```\w*\n[\s\S]*?```)/g;
      const segments = text.split(codeBlockRegex);
      const isDark = isDarkBackground(theme.background);

      return segments.map((segment, segIdx) => {
        // Check if this segment is a fenced code block
        const blockMatch = segment.match(/^```(\w*)\n([\s\S]*?)```$/);
        if (blockMatch) {
          const lang = blockMatch[1] || "text";
          const code = blockMatch[2];

          if (unstylizedMode) {
            return (
              <span key={`code-${segIdx}`} style={{ display: "block", whiteSpace: "pre" }}>
                {`\`\`\`${lang}\n${code}\`\`\``}
              </span>
            );
          }

          const cacheKey = `block:${lang}:${isDark}:${code}`;
          const tokens = codeHighlightCache.get(cacheKey);
          const codeLines = code.split("\n");

          return (
            <span
              key={`code-${segIdx}`}
              style={{
                display: "block",
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: "0.9em",
                lineHeight: "1.5",
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                borderRadius: "8px",
                padding: "12px 16px",
                margin: "8px 0",
                overflowX: "auto",
                whiteSpace: "pre",
              }}
              data-testid="code-block"
            >
              {/* Language label */}
              {lang && lang !== "text" && (
                <span
                  style={{
                    display: "block",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    opacity: 0.4,
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  {lang}
                </span>
              )}
              {/* Line numbers + highlighted code */}
              {tokens ? (
                renderCodeTokens(tokens)
              ) : (
                // Fallback: plain code with line numbers
                codeLines.map((codeLine, lineIdx) => (
                  <React.Fragment key={lineIdx}>
                    <span style={{ opacity: 0.3, userSelect: "none", display: "inline-block", width: "2em", textAlign: "right", marginRight: "1em" }}>
                      {lineIdx + 1}
                    </span>
                    {codeLine}
                    {lineIdx < codeLines.length - 1 && "\n"}
                  </React.Fragment>
                ))
              )}
            </span>
          );
        }

        // Regular text segment — process line by line for headings/todos
        const lines = segment.split("\n");
        const elements: React.ReactNode[] = [];
        let regularLines: string[] = [];

        const flushRegular = (trailingNewline = false) => {
          if (regularLines.length === 0) return;
          const joined = regularLines.join("\n");
          elements.push(
            <React.Fragment key={`reg-${elements.length}`}>
              {renderHighlightsForText(joined)}
              {trailingNewline && "\n"}
            </React.Fragment>,
          );
          regularLines = [];
        };

        const headingSizes: Record<number, { fontSize: string; fontWeight: number }> = {
          1: { fontSize: "1.8em", fontWeight: 700 },
          2: { fontSize: "1.5em", fontWeight: 700 },
          3: { fontSize: "1.25em", fontWeight: 600 },
          4: { fontSize: "1.1em", fontWeight: 600 },
        };

        // Track character offset for todo toggles (relative to full content)
        // Find where this segment starts in the original content
        let segmentStart = 0;
        for (let s = 0; s < segIdx; s++) {
          segmentStart += segments[s].length;
        }
        let charOffset = segmentStart;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const isLast = i === lines.length - 1;

          // Check for heading: # through ####
          const headingMatch = line.match(/^(#{1,4})\s(.+)$/);
          if (headingMatch) {
            flushRegular(true);
            const level = headingMatch[1].length as 1 | 2 | 3 | 4;
            const hashes = headingMatch[1];
            const headingText = headingMatch[2];
            const style = headingSizes[level];

            if (unstylizedMode) {
              elements.push(
                <React.Fragment key={`h-${segIdx}-${i}`}>
                  <span>{hashes} {headingText}</span>
                  {!isLast && "\n"}
                </React.Fragment>,
              );
              charOffset += line.length + (isLast ? 0 : 1);
              continue;
            }

            elements.push(
              <React.Fragment key={`h-${segIdx}-${i}`}>
                <span
                  style={{
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    color: theme.text,
                    opacity: 0.5,
                    display: "inline",
                  }}
                  data-testid={`heading-${level}`}
                >
                  <span style={{ opacity: 0.5 }}>{hashes} </span>
                  {headingText}
                </span>
                {!isLast && "\n"}
              </React.Fragment>,
            );
            charOffset += line.length + (isLast ? 0 : 1);
            continue;
          }

          // Check for todo: - [ ] or - [x]/- [X]
          const todoMatch = line.match(/^(- \[)([ xX])(\] ?)(.*)$/);
          if (todoMatch) {
            flushRegular(true);
            const isChecked = todoMatch[2].toLowerCase() === "x";
            const todoText = todoMatch[4];
            const checkboxOffset = charOffset + 3;

            if (unstylizedMode) {
              elements.push(
                <React.Fragment key={`todo-${segIdx}-${i}`}>
                  <span>{line}</span>
                  {!isLast && "\n"}
                </React.Fragment>,
              );
              charOffset += line.length + (isLast ? 0 : 1);
              continue;
            }

            elements.push(
              <React.Fragment key={`todo-${segIdx}-${i}`}>
                <span style={{ display: "inline" }}>
                  <span
                    role="checkbox"
                    aria-checked={isChecked}
                    data-checkbox-offset={checkboxOffset}
                    onClick={(e) => {
                      e.stopPropagation();
                      const toggleChar = isChecked ? " " : "x";
                      const newContent =
                        content.slice(0, checkboxOffset) +
                        toggleChar +
                        content.slice(checkboxOffset + 1);
                      setContent(newContent);
                    }}
                    style={{
                      display: "inline-flex",
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      border: `2px solid ${theme.accent}`,
                      backgroundColor: isChecked ? theme.accent : "transparent",
                      verticalAlign: "middle",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "4px",
                      position: "relative",
                      top: "-1px",
                      flexShrink: 0,
                    }}
                    data-testid={`todo-checkbox-${i}`}
                  >
                    {isChecked && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke={isDarkBackground(theme.accent) ? "#fff" : "#000"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2,5 4,7.5 8,2.5" />
                      </svg>
                    )}
                  </span>
                  <span
                    style={
                      isChecked
                        ? {
                            opacity: 0.5,
                            textDecoration: "line-through",
                            textDecorationColor: theme.text,
                            textDecorationThickness: "2px",
                          }
                        : undefined
                    }
                  >
                    {renderHighlightsForText(todoText)}
                  </span>
                </span>
                {!isLast && "\n"}
              </React.Fragment>,
            );
            charOffset += line.length + (isLast ? 0 : 1);
            continue;
          }

          // Regular line
          regularLines.push(line);
          charOffset += line.length + (isLast ? 0 : 1);
        }

        flushRegular();
        return <React.Fragment key={`seg-${segIdx}`}>{elements}</React.Fragment>;
      });
    },
    [content, setContent, renderHighlightsForText, renderCodeTokens, codeHighlightCache, theme.text, theme.accent, theme.background, unstylizedMode],
  );

  // Full code mode renderer — entire content highlighted as code
  const renderCodeMode = useCallback(() => {
    if (!content) return null;

    const isDark = isDarkBackground(theme.background);
    const cacheKey = `full:${codeLanguage}:${isDark}:${content}`;
    const tokens = codeHighlightCache.get(cacheKey);
    const lines = content.split("\n");

    return (
      <span style={{ whiteSpace: "pre-wrap" }}>
        {tokens ? (
          // Shiki-highlighted tokens
          renderCodeTokens(tokens)
        ) : (
          // Fallback: plain text with line numbers
          lines.map((line, idx) => (
            <React.Fragment key={idx}>
              <span
                style={{
                  opacity: 0.3,
                  userSelect: "none",
                  display: "inline-block",
                  width: "2.5em",
                  textAlign: "right",
                  marginRight: "1em",
                }}
              >
                {idx + 1}
              </span>
              {line}
              {idx < lines.length - 1 && "\n"}
            </React.Fragment>
          ))
        )}
      </span>
    );
  }, [content, codeLanguage, codeHighlightCache, renderCodeTokens, theme.background]);

  // Render content with inline char count badges after each paragraph
  const renderWithCharCounts = useCallback(
    (text: string) => {
      if (!showCharCounts || !text) return renderContentWithMarkdown(text);

      // Split into paragraphs (double newline)
      const parts = text.split(/(\n\n+)/);
      return parts.map((part, i) => {
        // Paragraph separator — render as-is
        if (/^\n\n+$/.test(part)) return <span key={`sep-${i}`}>{part}</span>;
        // Empty
        if (!part.trim()) return <span key={`empty-${i}`}>{part}</span>;

        const cc = countChars(part);
        const wc = countWords(part);
        return (
          <span key={`para-${i}`}>
            {renderContentWithMarkdown(part)}
            <span
              style={{
                display: "inline",
                fontSize: "9px",
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
                color: `${theme.text}40`,
                marginLeft: "6px",
                verticalAlign: "baseline",
                letterSpacing: "0.5px",
                fontWeight: 500,
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {wc}w {cc}c
            </span>
          </span>
        );
      });
    },
    [showCharCounts, renderContentWithMarkdown, theme.text],
  );

  // Wrapper that applies focus mode dimming by splitting content into 3 parts
  const renderHighlights = useCallback(() => {
    if (!content) return null;

    // No focus mode — render with markdown-aware pipeline
    if (!hasFocusNav || !focusRange) {
      return renderWithCharCounts(content);
    }

    // Adjust split points to avoid breaking inside ~~...~~ blocks
    const strikePattern = /~~(?:[^~]|~(?!~))+~~/g;
    let safeStart = focusRange.start;
    let safeEnd = focusRange.end;
    let m;
    while ((m = strikePattern.exec(content)) !== null) {
      const blockEnd = m.index + m[0].length;
      if (safeStart > m.index && safeStart < blockEnd) {
        safeStart = m.index;
      }
      if (safeEnd > m.index && safeEnd < blockEnd) {
        safeEnd = blockEnd;
      }
    }

    const dimBeforeText = content.slice(0, safeStart);
    const focusText = content.slice(safeStart, safeEnd);
    const dimAfterText = content.slice(safeEnd);

    return (
      <>
        {dimBeforeText && (
          <span
            style={{
              opacity: isMobile ? 0.12 : 0.10,
              transition: "opacity 0.4s ease",
            }}
          >
            {renderContentWithMarkdown(dimBeforeText)}
          </span>
        )}
        <span
          data-testid="focus-range"
          style={{
            opacity: 1,
            backgroundColor: isMobile ? `${theme.accent}20` : "transparent",
            borderBottom: isMobile ? "none" : `2px solid ${theme.accent}`,
            boxShadow: isMobile
              ? `0 0 0 1px ${theme.accent}35, 0 0 0 4px ${theme.accent}12`
              : "none",
            borderRadius: isMobile ? "6px" : undefined,
            padding: isMobile ? "1px 2px" : undefined,
            paddingBottom: isMobile ? undefined : "1px",
            boxDecorationBreak: isMobile ? "clone" : undefined,
            WebkitBoxDecorationBreak: isMobile ? "clone" : undefined,
            transition:
              "opacity 0.4s ease, background-color 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          {renderContentWithMarkdown(focusText)}
        </span>
        {dimAfterText && (
          <span
            style={{
              opacity: isMobile ? 0.12 : 0.10,
              transition: "opacity 0.4s ease",
            }}
          >
            {renderContentWithMarkdown(dimAfterText)}
          </span>
        )}
      </>
    );
  }, [
    content,
    hasFocusNav,
    focusRange,
    isMobile,
    renderContentWithMarkdown,
    renderWithCharCounts,
    theme.accent,
  ]);

  // Build a map of rhymeKey -> color for song mode
  const rhymeColorMap = useMemo(() => {
    if (!songData || !rhymeColors.length) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const group of songData.rhymeGroups) {
      map.set(group.key, rhymeColors[group.colorIndex] || rhymeColors[0]);
    }
    return map;
  }, [songData, rhymeColors]);

  const renderSongHighlights = useCallback(() => {
    if (!content || !songData) return null;

    const lines = content.split("\n");
    return lines.map((lineText, lineIdx) => {
      const songLine = songData.lines[lineIdx];
      if (!songLine || songLine.words.length === 0) {
        return (
          <React.Fragment key={`sl-${lineIdx}`}>
            {lineText}
            {lineIdx < lines.length - 1 ? "\n" : ""}
          </React.Fragment>
        );
      }

      // Tokenize the line for rendering
      const parts = lineText.split(/(\s+)/);
      let wordIdx = 0;

      const rendered = parts.map((part, partIdx) => {
        if (/^\s+$/.test(part)) {
          return <span key={`${lineIdx}-${partIdx}`}>{part}</span>;
        }

        const songWord = songLine.words[wordIdx];
        wordIdx++;

        if (!songWord) {
          return (
            <span key={`${lineIdx}-${partIdx}`} style={{ color: theme.text }}>
              {part}
            </span>
          );
        }

        const rhymeColor = rhymeColorMap.get(songWord.rhymeKey);
        const isRhymeDisabled = disabledRhymeKeys?.has(songWord.rhymeKey);
        const isRhymeFocused = focusedRhymeKey === null || focusedRhymeKey === songWord.rhymeKey;
        const isRhymeHovered = hoveredRhymeKey === songWord.rhymeKey;

        const syllableAnnotation = showSyllableAnnotations ? (
          <span
            style={{
              position: 'absolute',
              bottom: '-1.1em',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.55em',
              fontWeight: 600,
              color: rhymeColor || theme.text,
              opacity: rhymeColor ? 0.8 : 0.35,
              pointerEvents: 'none',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {songWord.syllables}
          </span>
        ) : null;

        if (rhymeColor && !isRhymeDisabled) {
          // Priority: hover > focused > dimmed
          const showFull = isRhymeHovered || isRhymeFocused;
          const markerOpacity = showFull
            ? (isDarkBackground(theme.background) ? "A0" : "88")
            : "20";
          return (
            <span key={`${lineIdx}-${partIdx}`} style={{ position: 'relative', display: 'inline' }}>
              {syllableAnnotation}
              <span
                style={{
                  backgroundColor: `${rhymeColor}${markerOpacity}`,
                  color: theme.text,
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: showFull ? 700 : "inherit",
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                  transition:
                    "background-color 0.3s ease, color 0.3s ease, font-weight 0.3s ease",
                }}
              >
                {part}
              </span>
            </span>
          );
        }

        return (
          <span key={`${lineIdx}-${partIdx}`} style={{ position: 'relative', display: 'inline' }}>
            {syllableAnnotation}
            <span style={{ color: theme.text, transition: "color 0.3s ease" }}>
              {part}
            </span>
          </span>
        );
      });

      return (
        <React.Fragment key={`sl-${lineIdx}`}>
          {rendered}
          {lineIdx < lines.length - 1 ? "\n" : ""}
        </React.Fragment>
      );
    });
  }, [content, songData, rhymeColorMap, theme.text, theme.background, showSyllableAnnotations, focusedRhymeKey, hoveredRhymeKey, disabledRhymeKeys]);

  return (
    <div
      className="relative w-full h-full overflow-hidden mx-auto transition-[max-width] duration-300 ease-in-out"
      style={{ maxWidth: maxWidth }}
    >
      {/* Backdrop (Visual Layer) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 pt-[55px] pb-[50vh] md:pt-[55px] lg:pt-[55px] whitespace-pre-wrap break-words pointer-events-none z-0 overflow-hidden"
        style={{
          fontFamily: unstylizedMode
            ? "'Courier New', Courier, monospace"
            : codeMode
              ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
              : fontFamily,
          fontSize,
          lineHeight: effectiveLineHeight,
          letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
          color: unstylizedMode ? "#000000" : theme.text,
          paddingLeft: `${paddingLeft}px`,
          paddingRight: `${paddingRight}px`,
          transition: "padding-left 200ms ease, padding-right 200ms ease",
        }}
      >
        {unstylizedMode
          ? renderHighlights()
          : codeMode
            ? renderCodeMode()
            : songMode && songData
              ? renderSongHighlights()
              : renderHighlights()}
        {/* Cursor dot — Garfield-colored dot at end of text when cursor is at frontier */}
        {cursorAtFrontier && content.length > 0 && !unstylizedMode && (
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: lastWordColor,
              boxShadow: `0 0 6px 1px ${lastWordColor}55`,
              verticalAlign: "baseline",
              marginLeft: "2px",
              marginBottom: "2px",
            }}
            data-testid="cursor-dot"
          />
        )}
        {/* Frontier marker — green "available" badge when cursor is mid-text */}
        {!cursorAtFrontier && content.length > 0 && !unstylizedMode && (
          <span
            className="animate-frontier-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginLeft: "6px",
              padding: "2px 10px 2px 8px",
              borderRadius: "9999px",
              backgroundColor: "rgba(34, 197, 94, 0.10)",
              verticalAlign: "middle",
              lineHeight: "1",
            }}
            data-testid="frontier-marker"
          >
            <span
              className="animate-frontier-dot"
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#22c55e",
                letterSpacing: "0.01em",
              }}
            >
              available
            </span>
          </span>
        )}
      </div>

      {/* Last-focused-word overlay — visible when in sentence/paragraph mode */}
      {!isMobile && focusNavState && focusNavState.mode !== "word" && focusNavState.mode !== "none" && focusNavState.lastFocusedWordRange && (
        <div
          className="absolute inset-0 pt-[55px] pb-[50vh] md:pt-[55px] lg:pt-[55px] whitespace-pre-wrap break-words pointer-events-none z-[3] overflow-hidden"
          style={{
            fontFamily: unstylizedMode
              ? "'Courier New', Courier, monospace"
              : codeMode
                ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                : fontFamily,
            fontSize,
            lineHeight: effectiveLineHeight,
            letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
            color: "transparent",
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
            transition: "padding-left 200ms ease, padding-right 200ms ease",
          }}
        >
          <span>{content.slice(0, focusNavState.lastFocusedWordRange.start)}</span>
          <span
            data-testid="focus-anchor"
            style={{
              backgroundColor: `${theme.accent}15`,
              borderBottom: `1px dashed ${theme.accent}66`,
              borderRadius: "2px",
            }}
          >
            {content.slice(
              focusNavState.lastFocusedWordRange.start,
              focusNavState.lastFocusedWordRange.end,
            )}
          </span>
          <span>{content.slice(focusNavState.lastFocusedWordRange.end)}</span>
        </div>
      )}

      {showPersistedSelectionOverlay && normalizedPersistedSelection && (
        <div
          ref={selectionOverlayRef}
          data-testid="persisted-selection-overlay"
          className="absolute inset-0 pt-[55px] pb-[50vh] md:pt-[55px] lg:pt-[55px] whitespace-pre-wrap break-words pointer-events-none z-[5] overflow-hidden"
          style={{
            fontFamily: unstylizedMode
              ? "'Courier New', Courier, monospace"
              : codeMode
                ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                : fontFamily,
            fontSize,
            lineHeight: effectiveLineHeight,
            letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
            color: "transparent",
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
            transition: "padding-left 200ms ease, padding-right 200ms ease",
          }}
        >
          <span>{content.slice(0, normalizedPersistedSelection.start)}</span>
          <span
            style={{
              backgroundColor: unstylizedMode ? "rgba(0, 0, 0, 0.15)" : theme.selection,
              borderRadius: "4px",
              boxShadow: unstylizedMode ? "none" : `0 0 0 1px ${theme.accent}40`,
            }}
          >
            {content.slice(
              normalizedPersistedSelection.start,
              normalizedPersistedSelection.end,
            )}
          </span>
          <span>{content.slice(normalizedPersistedSelection.end)}</span>
        </div>
      )}

      {/* Actual Input (Logic Layer) */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={() => {}} // Handled in onKeyDown and composition events
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEndWithAppend}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleMobileFocusClick}
        onFocus={() => {
          setIsTextareaFocused(true);
          if (persistedSelection && onRestoreSelection) {
            onRestoreSelection();
          }
        }}
        onBlur={() => setIsTextareaFocused(false)}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        inputMode="text"
        enterKeyHint="enter"
        autoFocus
        className="absolute inset-0 w-full h-full pt-[55px] pb-[50vh] md:pt-[55px] lg:pt-[55px] bg-transparent resize-none border-none outline-none z-10 whitespace-pre-wrap break-words overflow-y-auto no-scrollbar selection:text-transparent"
        style={{
          fontFamily: unstylizedMode
            ? "'Courier New', Courier, monospace"
            : codeMode
              ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
              : fontFamily,
          fontSize,
          lineHeight: effectiveLineHeight,
          letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
          color: "transparent",
          caretColor: cursorAtFrontier ? "transparent" : lastWordColor,
          opacity: 1,
          scrollbarWidth: "none",
          paddingLeft: `${paddingLeft}px`,
          paddingRight: `${paddingRight}px`,
          transition: "padding-left 200ms ease, padding-right 200ms ease",
          msOverflowStyle: "none",
          WebkitTouchCallout: "none",
        }}
        placeholder="Type here..."
      />
    </div>
  );
};

export default Typewriter;
