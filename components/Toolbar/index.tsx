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
      {/* Action Buttons */}
      <div className="pointer-events-auto">
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
        />
      </div>
    </footer>
  );
};

export default Toolbar;
