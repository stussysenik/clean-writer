import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RisoTheme } from '../types';

interface MarkdownPreviewProps {
  content: string;
  theme: RisoTheme;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme }) => {
  return (
    <div 
      className="w-full h-full p-12 overflow-y-auto prose max-w-none"
      style={{ 
        color: theme.text,
        fontFamily: '"Space Mono", monospace' 
      }}
    >
      <style>{`
        .prose h1, .prose h2, .prose h3, .prose h4 { color: ${theme.highlight.noun}; }
        .prose a { color: ${theme.highlight.verb}; }
        .prose strong { color: ${theme.highlight.noun}; }
        .prose em { color: ${theme.highlight.adjective}; }
        .prose del { color: ${theme.strikethrough}; text-decoration-color: ${theme.strikethrough}; text-decoration-thickness: 2px; }
        .prose blockquote { border-left-color: ${theme.accent}; color: ${theme.highlight.adjective}; }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || '*Nothing here yet...*'}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
