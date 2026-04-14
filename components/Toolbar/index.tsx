import React from "react";
import { RisoTheme, ViewMode, FocusMode } from "../../types";
import ActionButtons from "./ActionButtons";

interface ToolbarProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  hasStrikethroughs: boolean;
  focusMode: FocusMode;
  dimmed?: boolean;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onStrikethroughPointerDown?: () => void;
  onCleanStrikethroughs: () => void;
  onExport: () => void;
  onClear: () => void;
  onSampleText?: () => void;
  onCycleFocusMode: () => void;
  unstylizedMode: boolean;
  onToggleUnstylized: () => void;
  selectionCharCount?: number;
  selectionWordCount?: number;
  totalCharCount?: number;
  totalWordCount?: number;
  showCharCounts?: boolean;
  onToggleCharCounts?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  viewMode,
  hasStrikethroughs,
  focusMode,
  dimmed = false,
  onToggleView,
  onStrikethrough,
  onStrikethroughPointerDown,
  onCleanStrikethroughs,
  onExport,
  onClear,
  onSampleText,
  onCycleFocusMode,
  unstylizedMode,
  onToggleUnstylized,
  selectionCharCount = 0,
  selectionWordCount = 0,
  totalCharCount = 0,
  totalWordCount = 0,
  showCharCounts = false,
  onToggleCharCounts,
}) => {
  return (
    <footer
      className="absolute bottom-0 left-0 right-0 flex flex-col items-stretch z-50 pointer-events-none transition-opacity duration-300"
      style={{
        padding: "8px 13px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      {/* Action Buttons — horizontal scroll strip like ThemeSelector */}
      <div className="pointer-events-auto relative overflow-hidden">
        <div className="overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
          <ActionButtons
            theme={theme}
            viewMode={viewMode}
            hasStrikethroughs={hasStrikethroughs}
            focusMode={focusMode}
            onToggleView={onToggleView}
            onStrikethrough={onStrikethrough}
            onStrikethroughPointerDown={onStrikethroughPointerDown}
            onCleanStrikethroughs={onCleanStrikethroughs}
            onExport={onExport}
            onClear={onClear}
            onSampleText={onSampleText}
            onCycleFocusMode={onCycleFocusMode}
            unstylizedMode={unstylizedMode}
            onToggleUnstylized={onToggleUnstylized}
            selectionCharCount={selectionCharCount}
            selectionWordCount={selectionWordCount}
            totalCharCount={totalCharCount}
            totalWordCount={totalWordCount}
            showCharCounts={showCharCounts}
            onToggleCharCounts={onToggleCharCounts}
          />
        </div>
        {/* Right fade to signal more tools are scrollable */}
        <div
          className="absolute inset-y-0 right-0 w-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${theme.background})`,
          }}
        />
      </div>
    </footer>
  );
};

export default Toolbar;
