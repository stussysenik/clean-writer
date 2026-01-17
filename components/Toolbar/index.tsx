import React from 'react';
import { RisoTheme, ViewMode, HighlightConfig } from '../../types';
import SyntaxToggles from './SyntaxToggles';
import ActionButtons from './ActionButtons';

interface ToolbarProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  highlightConfig: HighlightConfig;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onExport: () => void;
  onClear: () => void;
  onWidthChange: (width: number) => void;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  // Solo mode props
  soloMode?: keyof HighlightConfig | null;
  onSoloToggle?: (key: keyof HighlightConfig | null) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  viewMode,
  maxWidth,
  highlightConfig,
  onToggleView,
  onStrikethrough,
  onExport,
  onClear,
  onWidthChange,
  onToggleHighlight,
  soloMode = null,
  onSoloToggle,
}) => {
  return (
    <footer
      className="absolute bottom-0 left-0 right-0 flex flex-col-reverse md:flex-row justify-between items-start md:items-end z-50 pointer-events-none"
      style={{
        padding: '16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        gap: '16px',
      }}
    >
      {/* Left: Interactive Tools */}
      <div className="flex flex-col gap-4 pointer-events-auto w-full md:w-auto">
        {/* Syntax Toggles Row - with horizontal scroll */}
        <div className="px-1">
          <SyntaxToggles
            theme={theme}
            highlightConfig={highlightConfig}
            onToggle={onToggleHighlight}
            visible={viewMode === 'write'}
            soloMode={soloMode}
            onSoloToggle={onSoloToggle}
          />
        </div>

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
    </footer>
  );
};

export default Toolbar;
