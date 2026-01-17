import React, { useRef, useEffect, useCallback, useState } from 'react';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../types';
import { useIMEComposition } from '../hooks/useIMEComposition';

interface TypewriterProps {
  content: string;
  setContent: (s: string) => void;
  theme: RisoTheme;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  fontSize: number;
  maxWidth: number;
  fontFamily: string;
}

const Typewriter: React.FC<TypewriterProps> = ({
  content,
  setContent,
  theme,
  syntaxData,
  highlightConfig,
  fontSize,
  maxWidth,
  fontFamily,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [ghostVisible, setGhostVisible] = useState(true);

  // IME composition handling for Chinese, Japanese, Korean, and other languages
  const {
    isComposing,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
  } = useIMEComposition();

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
    if (e.key.length === 1 || e.key === 'Enter') {
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
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Use passive event listener for scroll performance
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll, { passive: true });
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const renderHighlights = useCallback(() => {
    if (!content) return null;

    // First, split content by strikethrough syntax "~~...~~"
    // The regex captures the delimiter and content together.
    const chunks = content.split(/(~~(?:[^~]|~(?!~))+~~)/g);

    return chunks.map((chunk, chunkIndex) => {
      // If it is a strikethrough block
      if (chunk.startsWith('~~') && chunk.endsWith('~~') && chunk.length >= 4) {
        return (
          <span
            key={`st-${chunkIndex}`}
            style={{
              textDecoration: 'line-through',
              opacity: 0.5,
              textDecorationThickness: '2px',
              textDecorationColor: theme.strikethrough
            }}
          >
            {chunk}
          </span>
        );
      }

      // If it is normal text, process syntax highlighting
      const parts = chunk.split(/(\s+|[.,!?;:"'()\-]+)/g);

      return (
        <React.Fragment key={`chunk-${chunkIndex}`}>
          {parts.map((part, index) => {
            const lowerPart = part.toLowerCase().trim();
            let color = theme.text;
            let isMatch = false;

            if (!lowerPart) return <span key={index}>{part}</span>;

            // Check highlights based on config - order matters for priority
            // More specific types first (articles, interjections, etc.)
            if (highlightConfig.articles && syntaxData.articles.includes(lowerPart)) {
              color = theme.highlight.article;
              isMatch = true;
            } else if (highlightConfig.interjections && syntaxData.interjections.includes(lowerPart)) {
              color = theme.highlight.interjection;
              isMatch = true;
            } else if (highlightConfig.prepositions && syntaxData.prepositions.includes(lowerPart)) {
              color = theme.highlight.preposition;
              isMatch = true;
            } else if (highlightConfig.conjunctions && syntaxData.conjunctions.includes(lowerPart)) {
              color = theme.highlight.conjunction;
              isMatch = true;
            } else if (highlightConfig.pronouns && syntaxData.pronouns.includes(lowerPart)) {
              color = theme.highlight.pronoun;
              isMatch = true;
            } else if (highlightConfig.adverbs && syntaxData.adverbs.includes(lowerPart)) {
              color = theme.highlight.adverb;
              isMatch = true;
            } else if (highlightConfig.verbs && syntaxData.verbs.includes(lowerPart)) {
              color = theme.highlight.verb;
              isMatch = true;
            } else if (highlightConfig.adjectives && syntaxData.adjectives.includes(lowerPart)) {
              color = theme.highlight.adjective;
              isMatch = true;
            } else if (highlightConfig.nouns && syntaxData.nouns.includes(lowerPart)) {
              color = theme.highlight.noun;
              isMatch = true;
            }

            const style: React.CSSProperties = isMatch ? {
              color: color,
              fontWeight: 700,
              textShadow: theme.id === 'blueprint' && isMatch ? `0 0 1px ${color}` : 'none'
            } : {};

            return <span key={`${chunkIndex}-${index}`} style={style}>{part}</span>;
          })}
        </React.Fragment>
      );
    });
  }, [content, syntaxData, theme, highlightConfig]);

  return (
    <div
      className="relative w-full h-full overflow-hidden mx-auto transition-[max-width] duration-300 ease-in-out"
      style={{ maxWidth: maxWidth }}
    >
      {/* Backdrop (Visual Layer) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 px-4 py-6 md:px-8 md:py-12 whitespace-pre-wrap break-words pointer-events-none z-0 overflow-hidden"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          color: theme.text,
        }}
      >
        {renderHighlights()}
        {/* The Ghost Cursor - Always at the end */}
        <span
          style={{
            color: theme.cursor,
            opacity: ghostVisible ? 1 : 0,
            transition: 'opacity 0.1s',
            marginLeft: '1px',
            backgroundColor: theme.cursor,
            display: 'inline-block',
            width: '10px',
            height: '1em',
            verticalAlign: 'text-bottom'
          }}
        />
      </div>

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
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        autoFocus
        className="absolute inset-0 w-full h-full px-4 py-6 md:px-8 md:py-12 bg-transparent resize-none border-none outline-none z-10 whitespace-pre-wrap break-words overflow-y-auto"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          color: 'transparent',
          caretColor: theme.text, // The system cursor is visible to show "navigation" location
          opacity: 1
        }}
        placeholder="Type here..."
      />
    </div>
  );
};

export default Typewriter;
