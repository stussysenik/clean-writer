import React from 'react';
import { RisoTheme, ViewMode, HighlightConfig } from '../../types';
import SyntaxToggles from './SyntaxToggles';
import ActionButtons from './ActionButtons';
import WordCount from './WordCount';

interface ToolbarProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  wordCount: number;
  highlightConfig: HighlightConfig;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onExport: () => void;
  onClear: () => void;
  onWidthChange: (width: number) => void;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  viewMode,
  maxWidth,
  wordCount,
  highlightConfig,
  onToggleView,
  onStrikethrough,
  onExport,
  onClear,
  onWidthChange,
  onToggleHighlight,
}) => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex flex-col-reverse md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 z-50 pointer-events-none">
      {/* Left: Interactive Tools */}
      <div className="flex flex-col gap-2 md:gap-4 pointer-events-auto w-full md:w-auto">
        {/* Syntax Toggles Row */}
        <SyntaxToggles
          theme={theme}
          highlightConfig={highlightConfig}
          onToggle={onToggleHighlight}
          visible={viewMode === 'write'}
        />

        {/* Main Actions Row */}
        <ActionButtons
          theme={theme}
          viewMode={viewMode}
          maxWidth={maxWidth}
          onToggleView={onToggleView}
          onStrikethrough={onStrikethrough}
          onExport={onExport}
          onClear={onClear}
          onWidthChange={onWidthChange}
        />
      </div>

      {/* Right: Word Count */}
      <WordCount count={wordCount} theme={theme} />
    </footer>
  );
};

export default Toolbar;
