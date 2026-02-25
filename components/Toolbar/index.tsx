import React from "react";
import { RisoTheme, ViewMode } from "../../types";
import ActionButtons from "./ActionButtons";

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

  return (
    <footer
      className="absolute bottom-0 left-0 right-0 flex flex-col items-stretch z-50 pointer-events-none"
      style={{
        padding: "8px 13px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        gap: "4px",
      }}
    >
      {/* Line Width Slider — full-width bar above actions (hidden on mobile in preview mode) */}
      <div className={`flex items-center gap-3 px-3 py-2 pointer-events-auto self-center rounded-xl${viewMode === "preview" ? " hidden md:flex" : ""}`}
        style={{
          backgroundColor: `${theme.background}80`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <input
          type="range"
          min="300"
          max="1400"
          step="50"
          value={maxWidth}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          className="w-28 md:w-36 h-1 rounded-lg appearance-none cursor-pointer touch-manipulation"
          /* min touch target via padding; visual track stays 4px */
          style={{
            accentColor: theme.accent,
            background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${pct}%, ${theme.text}20 ${pct}%, ${theme.text}20 100%)`,
          }}
          aria-label="Line width"
          title="Line width"
        />
        <span
          className="text-[9px] opacity-50 tabular-nums font-mono pointer-events-none"
          style={{ color: theme.text }}
        >
          {maxWidth}px
        </span>
      </div>

      {/* Action Buttons — bottom row */}
      <div className="pointer-events-auto">
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
