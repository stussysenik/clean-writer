import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { RisoTheme, SyntaxSets, HighlightConfig } from '../types';
import { useIMEComposition } from '../hooks/useIMEComposition';
import {
  isHashtagToken,
  isNumberToken,
  isUrlToken,
  normalizeTokenForSyntaxLookup,
} from '../utils/syntaxPatterns';
import { replaceEmojisWithUTF } from '../utils/emojiUtils';

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
}

// Map from HighlightConfig key to syntax category key for color lookup
const HIGHLIGHT_TO_COLOR_KEY: Record<keyof HighlightConfig, keyof RisoTheme['highlight']> = {
  nouns: 'noun',
  pronouns: 'pronoun',
  verbs: 'verb',
  adjectives: 'adjective',
  adverbs: 'adverb',
  prepositions: 'preposition',
  conjunctions: 'conjunction',
  articles: 'article',
  interjections: 'interjection',
  urls: 'url',
  numbers: 'number',
  hashtags: 'hashtag',
};

function isTextInputKey(key: string): boolean {
  if (key.length === 1) return true;
  return key.length === 2 && /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(key);
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
}) => {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const selectionOverlayRef = useRef<HTMLDivElement>(null);
  const [ghostVisible, setGhostVisible] = useState(true);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Use the external ref if provided, otherwise use internal ref
  const textareaRef = externalTextareaRef || internalTextareaRef;

  // IME composition handling for Chinese, Japanese, Korean, and other languages
  const {
    isComposing,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
  } = useIMEComposition();

  // Garfield cursor: Calculate the color for the last word typed
  const lastWordColor = useMemo(() => {
    if (!content) return theme.cursor;

    const rawLastToken = content.trim().split(/\s+/).pop() || '';
    const lastWord = normalizeTokenForSyntaxLookup(rawLastToken);

    if (!lastWord) return theme.cursor;

    // Check which syntax category the last word belongs to (O(1) lookups with Sets)
    if (highlightConfig.articles && syntaxSets.articles.has(lastWord)) {
      return theme.highlight.article;
    }
    if (highlightConfig.urls && (syntaxSets.urls.has(lastWord) || isUrlToken(lastWord))) {
      return theme.highlight.url;
    }
    if (highlightConfig.hashtags && (syntaxSets.hashtags.has(lastWord) || isHashtagToken(lastWord))) {
      return theme.highlight.hashtag;
    }
    if (highlightConfig.numbers && (syntaxSets.numbers.has(lastWord) || isNumberToken(lastWord))) {
      return theme.highlight.number;
    }
    if (highlightConfig.interjections && syntaxSets.interjections.has(lastWord)) {
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

  // Blink effect for the ghost cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setGhostVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Skip handling during IME composition (Chinese, Japanese, Korean, etc.)
    if (isComposing) {
      return;
    }

    // 1. Strictly Disable Deletion
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      return;
    }

    // 2. Allow modifiers (for paste, copy, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 3. Handle character input (strictly append to end)
    if (isTextInputKey(e.key) || e.key === 'Enter') {
      e.preventDefault(); // Stop default insertion at cursor position

      const char = e.key === 'Enter' ? '\n' : e.key;

      // Force append to the very end
      const newContent = content + char;
      setContent(newContent);

      // Scroll to bottom to follow the "ghost" cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  // Handle IME composition end - append the composed text
  const handleCompositionEndWithAppend = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    handleCompositionEnd(e, (composedText: string) => {
      // Append the composed text to the end of content
      const newContent = content + composedText;
      setContent(newContent);

      // Scroll to bottom to follow the "ghost" cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 0);
    });
  };

  // Handle paste - append pasted text to end
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setContent(content + pastedText);

      // Scroll to bottom after paste
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
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

    const start = Math.max(0, Math.min(content.length, persistedSelection.start));
    const end = Math.max(0, Math.min(content.length, persistedSelection.end));

    if (start >= end) return null;

    return { start, end };
  }, [persistedSelection, content, showUtfEmojiCodes]);

  const showPersistedSelectionOverlay = !!normalizedPersistedSelection && !isTextareaFocused;

  // Use passive event listener for scroll performance
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll, { passive: true });
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Ensure frozen selection overlay is aligned when shown after a blur.
  useEffect(() => {
    if (!showPersistedSelectionOverlay || !textareaRef.current || !selectionOverlayRef.current) {
      return;
    }
    selectionOverlayRef.current.scrollTop = textareaRef.current.scrollTop;
  }, [showPersistedSelectionOverlay, textareaRef]);

  // Helper to determine which syntax category a word belongs to (O(1) lookups)
  const getWordCategory = useCallback((word: string): keyof HighlightConfig | null => {
    const lowerWord = normalizeTokenForSyntaxLookup(word);
    if (!lowerWord) return null;

    if (syntaxSets.urls.has(lowerWord) || isUrlToken(lowerWord)) return 'urls';
    if (syntaxSets.hashtags.has(lowerWord) || isHashtagToken(lowerWord)) return 'hashtags';
    if (syntaxSets.numbers.has(lowerWord) || isNumberToken(lowerWord)) return 'numbers';
    if (syntaxSets.articles.has(lowerWord)) return 'articles';
    if (syntaxSets.interjections.has(lowerWord)) return 'interjections';
    if (syntaxSets.prepositions.has(lowerWord)) return 'prepositions';
    if (syntaxSets.conjunctions.has(lowerWord)) return 'conjunctions';
    if (syntaxSets.pronouns.has(lowerWord)) return 'pronouns';
    if (syntaxSets.adverbs.has(lowerWord)) return 'adverbs';
    if (syntaxSets.verbs.has(lowerWord)) return 'verbs';
    if (syntaxSets.adjectives.has(lowerWord)) return 'adjectives';
    if (syntaxSets.nouns.has(lowerWord)) return 'nouns';

    return null;
  }, [syntaxSets]);

  const renderHighlights = useCallback(() => {
    if (!content) return null;

    // First, split content by strikethrough syntax "~~...~~"
    // The regex captures the delimiter and content together.
    const chunks = content.split(/(~~(?:[^~]|~(?!~))+~~)/g);

    return chunks.map((chunk, chunkIndex) => {
      // If it is a strikethrough block
      if (chunk.startsWith('~~') && chunk.endsWith('~~') && chunk.length >= 4) {
        const renderedStrikeChunk = showUtfEmojiCodes ? replaceEmojisWithUTF(chunk) : chunk;
        return (
          <span
            key={`st-${chunkIndex}`}
            style={{
              textDecoration: 'line-through',
              opacity: 0.5,
              textDecorationThickness: '2px',
              textDecorationColor: theme.strikethrough,
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
            }}
          >
            {renderedStrikeChunk}
          </span>
        );
      }

      // If it is normal text, process syntax highlighting
      // First split on URLs to preserve them as whole tokens, then tokenize the rest
      const renderedChunk = showUtfEmojiCodes ? replaceEmojisWithUTF(chunk) : chunk;
      const urlSplitPattern = /((?:https?:\/\/)\S+|(?:www\.)\S+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|dev|co|app|ai|edu|gov|me|info|biz)(?:\/\S*)?)/g;
      const urlTestPattern = /^(?:https?:\/\/)\S+$|^(?:www\.)\S+$|^(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|dev|co|app|ai|edu|gov|me|info|biz)(?:\/\S*)?$/i;
      const urlSplit = renderedChunk.split(urlSplitPattern);
      // Flatten: for non-URL segments, split on whitespace/punctuation; URL segments stay whole
      const parts: string[] = [];
      for (const segment of urlSplit) {
        if (urlTestPattern.test(segment)) {
          parts.push(segment);
        } else {
          // Tokenize on whitespace and punctuation, preserving contractions
          const subParts = segment.split(/(\s+|[.,!?;:"()\-]+|(?<!\w)['']|[''](?!\w))/g);
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
                <span
                  key={index}
                  style={{ transition: 'color 0.3s ease' }}
                >
                  {part}
                </span>
              );
            }

            // Check highlights based on config — O(1) Set.has() lookups
            // Priority: URLs → hashtags → numbers → NLP categories
            if (highlightConfig.urls && (syntaxSets.urls.has(normalizedPart) || isUrlToken(normalizedPart))) {
              color = theme.highlight.url;
              isMatch = true;
              matchCategory = 'urls';
            } else if (highlightConfig.hashtags && (syntaxSets.hashtags.has(normalizedPart) || isHashtagToken(normalizedPart))) {
              color = theme.highlight.hashtag;
              isMatch = true;
              matchCategory = 'hashtags';
            } else if (highlightConfig.numbers && (syntaxSets.numbers.has(normalizedPart) || isNumberToken(normalizedPart))) {
              color = theme.highlight.number;
              isMatch = true;
              matchCategory = 'numbers';
            } else if (highlightConfig.articles && syntaxSets.articles.has(normalizedPart)) {
              color = theme.highlight.article;
              isMatch = true;
              matchCategory = 'articles';
            } else if (highlightConfig.interjections && syntaxSets.interjections.has(normalizedPart)) {
              color = theme.highlight.interjection;
              isMatch = true;
              matchCategory = 'interjections';
            } else if (highlightConfig.prepositions && syntaxSets.prepositions.has(normalizedPart)) {
              color = theme.highlight.preposition;
              isMatch = true;
              matchCategory = 'prepositions';
            } else if (highlightConfig.conjunctions && syntaxSets.conjunctions.has(normalizedPart)) {
              color = theme.highlight.conjunction;
              isMatch = true;
              matchCategory = 'conjunctions';
            } else if (highlightConfig.pronouns && syntaxSets.pronouns.has(normalizedPart)) {
              color = theme.highlight.pronoun;
              isMatch = true;
              matchCategory = 'pronouns';
            } else if (highlightConfig.adverbs && syntaxSets.adverbs.has(normalizedPart)) {
              color = theme.highlight.adverb;
              isMatch = true;
              matchCategory = 'adverbs';
            } else if (highlightConfig.verbs && syntaxSets.verbs.has(normalizedPart)) {
              color = theme.highlight.verb;
              isMatch = true;
              matchCategory = 'verbs';
            } else if (highlightConfig.adjectives && syntaxSets.adjectives.has(normalizedPart)) {
              color = theme.highlight.adjective;
              isMatch = true;
              matchCategory = 'adjectives';
            } else if (highlightConfig.nouns && syntaxSets.nouns.has(normalizedPart)) {
              color = theme.highlight.noun;
              isMatch = true;
              matchCategory = 'nouns';
            }

            // Check if this word should glow (matching hovered category)
            const shouldGlow = hoveredCategory && matchCategory === hoveredCategory;
            const glowColor = shouldGlow ? color : 'transparent';

            const style: React.CSSProperties = {
              color: isMatch ? color : theme.text,
              fontWeight: isMatch ? 700 : 'inherit',
              textShadow: shouldGlow
                ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}80`
                : (theme.id === 'blueprint' && isMatch ? `0 0 1px ${color}` : 'none'),
              transition: 'color 0.3s ease, text-shadow 0.3s ease, font-weight 0.3s ease',
            };

            return <span key={`${chunkIndex}-${index}`} style={style}>{part}</span>;
          })}
        </React.Fragment>
      );
    });
  }, [content, syntaxSets, theme, highlightConfig, hoveredCategory, showUtfEmojiCodes]);

  return (
    <div
      className="relative w-full h-full overflow-hidden mx-auto transition-[max-width] duration-300 ease-in-out"
      style={{ maxWidth: maxWidth }}
    >
      {/* Backdrop (Visual Layer) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 px-[13px] py-[21px] md:px-[21px] md:py-[34px] lg:px-[34px] lg:py-[55px] whitespace-pre-wrap break-words pointer-events-none z-0 overflow-hidden"
        style={{
          fontFamily,
          fontSize,
          lineHeight: '1.6',
          color: theme.text,
        }}
      >
        {renderHighlights()}
        {/* The Ghost Cursor - Always at the end, color matches last typed word (Garfield cursor) */}
        <span
          data-testid="ghost-cursor"
          style={{
            color: lastWordColor,
            opacity: ghostVisible ? 1 : 0,
            transition: 'opacity 0.1s, background-color 0.3s ease',
            marginLeft: '1px',
            backgroundColor: lastWordColor,
            display: 'inline-block',
            width: '10px',
            height: '1em',
            verticalAlign: 'text-bottom'
          }}
        />
      </div>

      {showPersistedSelectionOverlay && normalizedPersistedSelection && (
        <div
          ref={selectionOverlayRef}
          data-testid="persisted-selection-overlay"
          className="absolute inset-0 px-[13px] py-[21px] md:px-[21px] md:py-[34px] lg:px-[34px] lg:py-[55px] whitespace-pre-wrap break-words pointer-events-none z-[5] overflow-hidden"
          style={{
            fontFamily,
            fontSize,
            lineHeight: '1.6',
            color: 'transparent',
          }}
        >
          <span>{content.slice(0, normalizedPersistedSelection.start)}</span>
          <span
            style={{
              backgroundColor: theme.selection,
              borderRadius: '4px',
              boxShadow: `0 0 0 1px ${theme.accent}40`,
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
        onChange={() => { }} // Handled in onKeyDown and composition events
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEndWithAppend}
        onFocus={() => setIsTextareaFocused(true)}
        onBlur={() => setIsTextareaFocused(false)}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        inputMode="text"
        enterKeyHint="enter"
        autoFocus
        className="absolute inset-0 w-full h-full px-[13px] py-[21px] md:px-[21px] md:py-[34px] lg:px-[34px] lg:py-[55px] bg-transparent resize-none border-none outline-none z-10 whitespace-pre-wrap break-words overflow-y-auto"
        style={{
          fontFamily,
          fontSize,
          lineHeight: '1.6',
          color: 'transparent',
          caretColor: lastWordColor, // Garfield cursor: caret color matches last typed word's syntax
          transition: 'caret-color 0.3s ease',
          opacity: 1
        }}
        placeholder="Type here..."
      />
    </div>
  );
};

export default Typewriter;
