import React, { useState, useEffect } from 'react';
import { THEMES, THEME_STORAGE_KEY } from './constants';
import { analyzeSyntax } from './services/localSyntaxService';
import { SyntaxAnalysis, ViewMode, HighlightConfig } from './types';
import Typewriter from './components/Typewriter';
import MarkdownPreview from './components/MarkdownPreview';
import ConfirmDialog from './components/ConfirmDialog';
import Toolbar from './components/Toolbar';
import ThemeSelector from './components/Toolbar/ThemeSelector';

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

  const [themeId, setThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved && THEMES.some(t => t.id === saved) ? saved : 'classic';
    } catch {
      return 'classic';
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>('write');
  const [syntaxData, setSyntaxData] = useState<SyntaxAnalysis>({ nouns: [], verbs: [], adjectives: [], conjunctions: [] });
  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>({
    nouns: true,
    verbs: true,
    adjectives: true,
    conjunctions: true
  });

  const [fontSize, setFontSize] = useState(24);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  // Responsive Font Size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setFontSize(isMobile ? 18 : 24);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync selection color CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--selection-color', currentTheme.selection);
  }, [currentTheme]);

  // Sync theme-color meta tag for PWA
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', currentTheme.background);
    }
  }, [currentTheme]);

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

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn("Could not save theme");
    }
  }, [themeId]);

  // Helper to merge new syntax data with existing data
  const updateSyntaxData = (newData: SyntaxAnalysis) => {
    setSyntaxData(prev => ({
      nouns: Array.from(new Set([...prev.nouns, ...newData.nouns])),
      verbs: Array.from(new Set([...prev.verbs, ...newData.verbs])),
      adjectives: Array.from(new Set([...prev.adjectives, ...newData.adjectives])),
      conjunctions: Array.from(new Set([...prev.conjunctions, ...newData.conjunctions])),
    }));
  };

  // Syntax analysis
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (content.length > 0) {
        const result = await analyzeSyntax(content);
        updateSyntaxData(result);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [content]);

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean-writer.md';
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'write' ? 'preview' : 'write');
  };

  return (
    <div
      className="w-full h-[100dvh] flex flex-col relative overflow-hidden transition-colors duration-500 font-mono"
      style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
        }}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearDialogOpen(false)}
        theme={currentTheme}
      />

      {/* Theme Selector */}
      <ThemeSelector
        currentTheme={currentTheme}
        themeId={themeId}
        onThemeChange={setThemeId}
      />

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

      {/* Bottom Toolbar */}
      <Toolbar
        theme={currentTheme}
        viewMode={viewMode}
        maxWidth={maxWidth}
        wordCount={wordCount}
        highlightConfig={highlightConfig}
        onToggleView={toggleViewMode}
        onStrikethrough={handleStrikethrough}
        onExport={handleExport}
        onClear={handleClearRequest}
        onWidthChange={setMaxWidth}
        onToggleHighlight={toggleHighlight}
      />
    </div>
  );
};

export default App;
