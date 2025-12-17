import React, { useState, useEffect } from 'react';
import { THEMES } from './constants';
// Switch to local syntax service
import { analyzeSyntax } from './services/localSyntaxService';
import { SyntaxAnalysis, ViewMode, HighlightConfig } from './types';
import Typewriter from './components/Typewriter';
import MarkdownPreview from './components/MarkdownPreview';
import ConfirmDialog from './components/ConfirmDialog';

// --- Expressive Icons ---

const IconEyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconEyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
);

const IconStrike = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16" /><path d="M7 16h10" /><path d="M7 8h10" /><path d="M9 4h6" /><path d="M9 20h6" /></svg>
);

const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
);

const IconAnalyze = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" /></svg>
);

const IconWidth = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2" /><path d="M5 15l-3-3 3-3" /><path d="M19 9l3 3-3 3" /></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

// Part of Speech Icons
const IconNoun = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
const IconVerb = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
const IconAdj = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>;
const IconConj = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;


const App: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    try {
      return localStorage.getItem('riso_flow_content') || "";
    } catch (e) {
      console.warn("Could not access local storage");
      return "";
    }
  });

  const [maxWidth, setMaxWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('riso_flow_max_width');
      return saved ? parseInt(saved, 10) : 800;
    } catch {
      return 800;
    }
  });

  const [themeId, setThemeId] = useState<string>('classic');
  const [viewMode, setViewMode] = useState<ViewMode>('write');
  const [syntaxData, setSyntaxData] = useState<SyntaxAnalysis>({ nouns: [], verbs: [], adjectives: [], conjunctions: [] });
  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>({
    nouns: true,
    verbs: true,
    adjectives: true,
    conjunctions: true
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Responsive Font Size & Layout Logic
  const [fontSize, setFontSize] = useState(24);
  const [showWidthControl, setShowWidthControl] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setFontSize(isMobile ? 18 : 24);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  // Persist content to local storage
  useEffect(() => {
    try {
      localStorage.setItem('riso_flow_content', content);
    } catch (e) {
      console.warn("Could not save to local storage");
    }
  }, [content]);

  // Persist maxWidth
  useEffect(() => {
    try {
      localStorage.setItem('riso_flow_max_width', maxWidth.toString());
    } catch (e) {
      console.warn("Could not save max width");
    }
  }, [maxWidth]);

  // Helper to merge new syntax data with existing data to prevent loss
  const updateSyntaxData = (newData: SyntaxAnalysis) => {
    setSyntaxData(prev => ({
      nouns: Array.from(new Set([...prev.nouns, ...newData.nouns])),
      verbs: Array.from(new Set([...prev.verbs, ...newData.verbs])),
      adjectives: Array.from(new Set([...prev.adjectives, ...newData.adjectives])),
      conjunctions: Array.from(new Set([...prev.conjunctions, ...newData.conjunctions])),
    }));
  };

  useEffect(() => {
    // Shorter debounce for local analysis (500ms)
    const handler = setTimeout(async () => {
      // Remove API Key check - local analysis is free and fast
      if (content.length > 0) {
        setIsAnalyzing(true);
        const result = await analyzeSyntax(content);
        updateSyntaxData(result);
        setIsAnalyzing(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [content]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSyntax(content);
    updateSyntaxData(result);
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riso-flow.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearRequest = () => {
    setIsClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    setContent("");
    setSyntaxData({ nouns: [], verbs: [], adjectives: [], conjunctions: [] });
    setIsClearDialogOpen(false);
  };

  const handleStrikethrough = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;
      const selectedText = content.substring(start, end);
      const newContent = content.substring(0, start) + `~~${selectedText}~~` + content.substring(end);
      setContent(newContent);
      setTimeout(() => textarea.focus(), 10);
    }
  };

  const toggleHighlight = (key: keyof HighlightConfig) => {
    setHighlightConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="w-full h-[100dvh] flex flex-col relative overflow-hidden transition-colors duration-500 font-mono"
      style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearDialogOpen(false)}
        theme={currentTheme}
      />

      {/* Top Right: Theme Toggles */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex gap-2 md:gap-4 flex-wrap justify-end max-w-[50vw]">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border border-black/10 shadow-sm transition-all duration-300 ${themeId === t.id ? 'scale-125 ring-2 ring-offset-2' : 'hover:scale-110'}`}
            style={{
              backgroundColor: t.accent,
              ringColor: t.text
            }}
            title={t.name}
          />
        ))}
      </div>

      {/* Main Area */}
      <main className="flex-1 w-full h-full relative z-10 pt-4 md:pt-10 transition-all duration-300 ease-in-out">
        {viewMode === 'write' ? (
          <Typewriter
            content={content}
            setContent={setContent}
            theme={currentTheme}
            syntaxData={syntaxData}
            highlightConfig={highlightConfig}
            fontSize={fontSize}
            maxWidth={maxWidth}
          />
        ) : (
          <div
            className="mx-auto h-full relative z-10 transition-[max-width] duration-300 ease-in-out px-4 py-8 md:px-0 md:py-0"
            style={{ maxWidth: maxWidth }}
          >
            <MarkdownPreview content={content} theme={currentTheme} />
          </div>
        )}
      </main>

      {/* Bottom Toolbar Area */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex justify-between items-end z-50 pointer-events-none">

        {/* Left: Interactive Tools */}
        <div className="flex flex-col gap-2 md:gap-4 pointer-events-auto">

          {/* Syntax Toggles Row */}
          <div className="flex gap-1 md:gap-2 mb-1 md:mb-2 p-1 md:p-2 bg-black/5 rounded-lg backdrop-blur-sm w-fit transition-opacity duration-300" style={{ opacity: viewMode === 'write' ? 1 : 0 }}>
            <button onClick={() => toggleHighlight('nouns')}
              className={`p-1.5 md:p-2 rounded hover:bg-white/50 transition-all ${highlightConfig.nouns ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
              style={{ color: currentTheme.highlight.noun }}
              title="Highlight Nouns">
              <IconNoun />
            </button>
            <button onClick={() => toggleHighlight('verbs')}
              className={`p-1.5 md:p-2 rounded hover:bg-white/50 transition-all ${highlightConfig.verbs ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
              style={{ color: currentTheme.highlight.verb }}
              title="Highlight Verbs">
              <IconVerb />
            </button>
            <button onClick={() => toggleHighlight('adjectives')}
              className={`p-1.5 md:p-2 rounded hover:bg-white/50 transition-all ${highlightConfig.adjectives ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
              style={{ color: currentTheme.highlight.adjective }}
              title="Highlight Adjectives">
              <IconAdj />
            </button>
            <button onClick={() => toggleHighlight('conjunctions')}
              className={`p-1.5 md:p-2 rounded hover:bg-white/50 transition-all ${highlightConfig.conjunctions ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
              style={{ color: currentTheme.highlight.conjunction }}
              title="Highlight Conjunctions">
              <IconConj />
            </button>
          </div>

          {/* Main Actions Row */}
          <div className="flex gap-3 md:gap-6 items-center">
            <button onClick={() => setViewMode(viewMode === 'write' ? 'preview' : 'write')}
              className="hover:scale-110 transition-transform opacity-60 hover:opacity-100"
              title={viewMode === 'write' ? 'Preview' : 'Edit'}>
              {viewMode === 'write' ? <IconEyeOpen /> : <IconEyeClosed />}
            </button>

            <div className="w-px h-6 bg-current opacity-20"></div>

            <button onClick={handleStrikethrough}
              onMouseDown={(e) => e.preventDefault()}
              disabled={viewMode === 'preview'}
              className="hover:scale-110 transition-transform opacity-60 hover:opacity-100 disabled:opacity-20"
              title="Strikethrough (Select text first)">
              <IconStrike />
            </button>
            <button onClick={handleAnalyze}
              className={`hover:scale-110 transition-transform opacity-60 hover:opacity-100 ${isAnalyzing ? 'animate-pulse text-riso-pink' : ''}`}
              title="Analyze Syntax">
              <IconAnalyze />
            </button>
            <button onClick={handleExport}
              className="hover:scale-110 transition-transform opacity-60 hover:opacity-100"
              title="Export Markdown">
              <IconDownload />
            </button>
            <button onClick={handleClearRequest}
              className="hover:scale-110 transition-transform opacity-60 hover:opacity-100 hover:text-riso-pink"
              title="Clear Content">
              <IconTrash />
            </button>

            <div className="w-px h-6 bg-current opacity-20"></div>

            {/* Width Control */}
            <div className="relative flex items-center group">
              <button
                onClick={() => setShowWidthControl(!showWidthControl)}
                className={`hover:scale-110 transition-transform opacity-60 hover:opacity-100 ${showWidthControl ? 'opacity-100' : ''}`}
                title="Adjust Line Width"
              >
                <IconWidth />
              </button>

              {showWidthControl && (
                <div className="absolute bottom-full left-0 mb-4 p-2 bg-white/90 shadow-lg rounded-lg backdrop-blur-sm flex items-center border border-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <input
                    type="range"
                    min="300"
                    max="1400"
                    step="50"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current"
                    style={{ accentColor: currentTheme.accent }}
                  />
                  <span className="ml-2 text-xs opacity-50 w-12 text-right">{maxWidth}px</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: Legible Word Count */}
        <div className="pointer-events-auto bg-black/5 px-3 py-1 md:px-4 md:py-2 rounded-lg backdrop-blur-sm flex-shrink-0">
          <span className="text-xl md:text-3xl font-bold font-mono tracking-tighter" style={{ color: currentTheme.text }}>
            {wordCount}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest ml-2 opacity-50">words</span>
        </div>

      </footer>
    </div>
  );
};

export default App;