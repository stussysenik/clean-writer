import React from 'react';
import { RisoTheme, ViewMode, HighlightConfig } from '../../types';
import ActionButtons from './ActionButtons';

interface ToolbarProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  highlightConfig: HighlightConfig;
  hasStrikethroughs: boolean;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onStrikethroughPointerDown?: () => void;
  onCleanStrikethroughs: () => void;
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
  hasStrikethroughs,
  onToggleView,
  onStrikethrough,
  onStrikethroughPointerDown,
  onCleanStrikethroughs,
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
        padding: '13px',
        paddingBottom: 'max(13px, env(safe-area-inset-bottom))',
        gap: '13px',
      }}
    >
      {/* Left: Interactive Tools */}
      <div className="flex flex-col gap-4 pointer-events-auto w-full md:w-auto">
        {/* Main Actions Row */}
        <ActionButtons
          theme={theme}
          viewMode={viewMode}
          maxWidth={maxWidth}
          hasStrikethroughs={hasStrikethroughs}
          onToggleView={onToggleView}
          onStrikethrough={onStrikethrough}
          onStrikethroughPointerDown={onStrikethroughPointerDown}
          onCleanStrikethroughs={onCleanStrikethroughs}
          onExport={onExport}
          onClear={onClear}
          onWidthChange={onWidthChange}
        />
      </div>
    </footer>
  );
};

export default Toolbar;
