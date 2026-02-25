import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RisoTheme } from "../types";
import { useBlinkCursor } from "../hooks/useBlinkCursor";

interface MarkdownPreviewProps {
  content: string;
  theme: RisoTheme;
  onBackToEdit?: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  theme,
  onBackToEdit,
}) => {
  const cursorVisible = useBlinkCursor();

  return (
    <div className="w-full h-full relative">
      {onBackToEdit && (
        <button
          onClick={onBackToEdit}
          className="sticky top-0 z-20 w-full py-3 text-center text-sm font-medium uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: `${theme.background}ee`,
            color: theme.text,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.text}15`
          }}
        >
          ← Back to editing
        </button>
      )}
      <div
        className="w-full h-full p-12 overflow-y-auto prose max-w-none"
        style={{
          color: theme.text,
          fontFamily: '"Space Mono", monospace',
        }}
      >
        <style>{`
          .prose h1, .prose h2, .prose h3, .prose h4 { color: inherit; }
          .prose a { color: inherit; text-decoration: underline; }
          .prose strong { color: inherit; }
          .prose em { color: inherit; }
          .prose del { color: inherit; opacity: 0.5; text-decoration: line-through; text-decoration-thickness: 2px; }
          .prose blockquote { border-left-color: ${theme.text}40; color: inherit; }
        `}</style>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || "*Nothing here yet...*"}
        </ReactMarkdown>
        <span
          data-testid="preview-cursor"
          style={{
            display: "inline-block",
            width: "10px",
            height: "1em",
            backgroundColor: theme.cursor,
            opacity: cursorVisible ? 1 : 0,
            verticalAlign: "text-bottom",
          }}
        />
      </div>
    </div>
  );
};

export default MarkdownPreview;
