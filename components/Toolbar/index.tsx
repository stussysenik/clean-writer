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
