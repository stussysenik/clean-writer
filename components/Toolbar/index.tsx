import React from "react";
import { RisoTheme, ViewMode } from "../../types";
import ActionButtons from "./ActionButtons";
import { getIconColor } from "../../utils/contrastAwareColor";

interface ToolbarProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  hasStrikethroughs: boolean;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onStrikethroughPointerDown?: () => void;
  onCleanStrikethroughs: () => void;
  onExport: () => void;
  onClear: () => void;
  onWidthChange: (width: number) => void;
  onSampleText?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  viewMode,
  maxWidth,
  hasStrikethroughs,
  onToggleView,
  onStrikethrough,
  onStrikethroughPointerDown,
  onCleanStrikethroughs,
  onExport,
  onClear,
  onWidthChange,
  onSampleText,
}) => {
  const pct = ((maxWidth - 300) / 1100) * 100;
  const iconColor = getIconColor(theme);

  return (
    <footer
      className="absolute bottom-0 left-0 right-0 flex flex-col-reverse md:flex-row justify-between items-start md:items-end z-50 pointer-events-none"
      style={{
        padding: "13px",
        paddingBottom: "max(13px, env(safe-area-inset-bottom))",
        gap: "13px",
      }}
    >
      {/* Left: Interactive Tools */}
      <div className="flex flex-col gap-2 pointer-events-auto w-full md:w-auto">
        {/* Width slider — always visible */}
        <div className="flex items-center gap-2 px-1" style={{ color: iconColor }}>
          <input
            type="range"
            min="300"
            max="1400"
            step="50"
            value={maxWidth}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            className="w-24 h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: theme.accent,
              background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${pct}%, ${theme.text}20 ${pct}%, ${theme.text}20 100%)`,
            }}
            aria-label="Line width"
          />
          <span className="text-[10px] opacity-40 tabular-nums">{maxWidth}px</span>
        </div>

        {/* Main Actions Row */}
        <ActionButtons
          theme={theme}
          viewMode={viewMode}
          hasStrikethroughs={hasStrikethroughs}
          onToggleView={onToggleView}
          onStrikethrough={onStrikethrough}
          onStrikethroughPointerDown={onStrikethroughPointerDown}
          onCleanStrikethroughs={onCleanStrikethroughs}
          onExport={onExport}
          onClear={onClear}
          onSampleText={onSampleText}
        />
      </div>
    </footer>
  );
};

export default Toolbar;
