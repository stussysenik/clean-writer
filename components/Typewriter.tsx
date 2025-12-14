import React, { useRef, useEffect, useCallback, useState } from 'react';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../types';

interface TypewriterProps {
  content: string;
  setContent: (s: string) => void;
  theme: RisoTheme;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  fontSize: number;
  maxWidth: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ 
  content, 
  setContent, 
  theme, 
  syntaxData,
  highlightConfig,
  fontSize,
  maxWidth
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [ghostVisible, setGhostVisible] = useState(true);

  // Blink effect for the ghost cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setGhostVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    
    // 1. Strictly Disable Deletion
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      return;
    }

    // 2. Allow modifiers
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

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop;
    }
  };

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
              textDecorationColor: theme.accent 
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

            // Check highlights based on config
            if (highlightConfig.verbs && syntaxData.verbs.includes(lowerPart)) {
              color = theme.highlight.verb;
              isMatch = true;
            } else if (highlightConfig.nouns && syntaxData.nouns.includes(lowerPart)) {
              color = theme.highlight.noun;
              isMatch = true;
            } else if (highlightConfig.adjectives && syntaxData.adjectives.includes(lowerPart)) {
              color = theme.highlight.adjective;
              isMatch = true;
            } else if (highlightConfig.conjunctions && syntaxData.conjunctions.includes(lowerPart)) {
              color = theme.highlight.conjunction;
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
        className="absolute inset-0 px-8 py-12 whitespace-pre-wrap break-words pointer-events-none z-0 overflow-hidden"
        style={{
          fontFamily: '"Courier Prime", monospace',
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          color: theme.text,
        }}
      >
        {renderHighlights()}
        {/* The Ghost Cursor - Always at the end */}
        <span 
          style={{ 
            color: theme.accent, 
            opacity: ghostVisible ? 1 : 0,
            transition: 'opacity 0.1s',
            marginLeft: '1px',
            backgroundColor: theme.accent,
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
        onChange={() => {}} // Handled in onKeyDown
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        autoFocus
        className="absolute inset-0 w-full h-full px-8 py-12 bg-transparent resize-none border-none outline-none z-10 whitespace-pre-wrap break-words overflow-y-auto"
        style={{
          fontFamily: '"Courier Prime", monospace',
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
