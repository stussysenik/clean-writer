import React, { useMemo } from "react";
import { RisoTheme, ViewMode, FocusMode } from "../../types";
import {
  IconEyeOpen,
  IconEyeClosed,
  IconStrike,
  IconDownload,
  IconTrash,
  IconMagicClean,
  IconSample,
  IconFocus,
  IconPlainText,
} from "./Icons";
import TouchButton from "../TouchButton";
import Tooltip from "../Tooltip";
import { getIconColor } from "../../utils/contrastAwareColor";
import { useResponsiveBreakpoint } from "../../hooks/useResponsiveBreakpoint";

interface ActionButtonsProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  hasStrikethroughs: boolean;
  focusMode: FocusMode;
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
  showCharCounts?: boolean;
  onToggleCharCounts?: () => void;
}

interface ActionButtonProps {
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  disabled?: boolean;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  shortcut?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  "data-testid"?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  onMouseDown,
  onPointerDown,
  onTouchStart,
  disabled = false,
  active = false,
  icon,
  label,
  tooltip,
  shortcut,
  className = "",
  style,
  ariaLabel,
  "data-testid": dataTestId,
}) => (
  <Tooltip content={tooltip} shortcut={shortcut} position="top" delay={400}>
    <TouchButton
      onClick={onClick}
      onMouseDown={onMouseDown}
      onPointerDown={onPointerDown}
      onTouchStart={onTouchStart}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-150 hover:bg-current/5 ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : active
            ? "opacity-100"
            : "opacity-60 hover:opacity-100"
      } ${className}`}
      style={style}
      title={tooltip}
      aria-label={ariaLabel || tooltip}
      data-testid={dataTestId}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-[9px] uppercase tracking-wider font-medium hidden sm:block">
        {label}
      </span>
    </TouchButton>
  </Tooltip>
);

const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  none: "Focus",
  sentence: "Sentence",
  word: "Word",
  paragraph: "Para",
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  theme,
  viewMode,
  onToggleView,
  hasStrikethroughs,
  focusMode,
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
  showCharCounts = false,
  onToggleCharCounts,
}) => {
  const iconColor = getIconColor(theme);
  const { isMobile } = useResponsiveBreakpoint();
  const mod = useMemo(() => {
    if (isMobile) return null;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    return isMac ? "\u2318\u21E7" : "Ctrl+Shift+";
  }, [isMobile]);

  return (
    <div
      className="flex flex-wrap gap-1 md:gap-2 items-center"
      style={{ color: unstylizedMode ? "#333333" : iconColor }}
    >
      {/* View modes group */}
      <ActionButton
        onClick={onToggleView}
        icon={viewMode === "write" ? <IconEyeOpen /> : <IconEyeClosed />}
        label={viewMode === "write" ? "Preview" : "Edit"}
        tooltip={viewMode === "write" ? "Preview markdown" : "Back to editing"}
        shortcut={mod ? `${mod}P` : undefined}
        ariaLabel={
          viewMode === "write" ? "Preview markdown" : "Switch to edit mode"
        }
      />

      <ActionButton
        onClick={onToggleUnstylized}
        active={unstylizedMode}
        icon={<IconPlainText />}
        label="Plain"
        tooltip={unstylizedMode ? "Exit plain text mode" : "Plain text mode — monospace, no colors"}
        shortcut={mod ? `${mod}U` : undefined}
        ariaLabel={unstylizedMode ? "Exit plain text mode" : "Enter plain text mode"}
        className={unstylizedMode ? "!opacity-100" : ""}
        style={unstylizedMode ? { color: theme.accent } : undefined}
        data-testid="unstylized-mode-btn"
      />

      {/* Edit tools group */}
      <ActionButton
        onClick={onStrikethrough}
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={onStrikethroughPointerDown}
        onTouchStart={onStrikethroughPointerDown}
        disabled={viewMode === "preview"}
        icon={<IconStrike />}
        label="Strike"
        tooltip="Apply strikethrough to selected text"
        shortcut={mod ? `${mod}X` : undefined}
        ariaLabel="Strikethrough selected text"
        data-testid="strikethrough-btn"
      />

      <ActionButton
        onClick={onCleanStrikethroughs}
        disabled={!hasStrikethroughs}
        icon={<IconMagicClean />}
        label="Clean"
        tooltip="Remove all ~~...~~ segments"
        shortcut={mod ? `${mod}K` : undefined}
        ariaLabel="Remove all struck text segments"
        data-testid="clean-strikethroughs-btn"
      />

      {/* Navigation group */}
      <ActionButton
        onClick={onCycleFocusMode}
        active={focusMode !== "none"}
        disabled={viewMode === "preview"}
        icon={<IconFocus />}
        label={FOCUS_MODE_LABELS[focusMode]}
        tooltip={focusMode === "none" ? "Focus mode (click to cycle)" : `Focus: ${focusMode} — ←/→ navigate, ↑/↓ change level`}
        shortcut={mod ? `${mod}F` : undefined}
        ariaLabel="Cycle focus mode"
        className={focusMode !== "none" ? "!opacity-100" : ""}
        style={focusMode !== "none" ? { color: theme.accent } : undefined}
      />

      {/* Char counts toggle */}
      {onToggleCharCounts && (
        <ActionButton
          onClick={onToggleCharCounts}
          active={showCharCounts}
          icon={<span style={{ fontSize: 16, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>#</span>}
          label={selectionCharCount > 0 ? `${selectionCharCount}c` : "Chars"}
          tooltip={showCharCounts ? "Hide character counts" : "Show character counts per paragraph"}
          ariaLabel="Toggle character counts"
          className={showCharCounts ? "!opacity-100" : ""}
          style={showCharCounts || selectionCharCount > 0 ? { color: theme.accent } : undefined}
        />
      )}

      {/* File ops group */}
      <ActionButton
        onClick={onExport}
        icon={<IconDownload />}
        label="Export"
        tooltip="Download as markdown file"
        shortcut={mod ? `${mod}E` : undefined}
        ariaLabel="Export markdown file"
      />

      {onSampleText && (
        <ActionButton
          onClick={onSampleText}
          icon={<IconSample />}
          label="Sample"
          tooltip="Load sample text"
          ariaLabel="Load sample text"
        />
      )}

      <ActionButton
        onClick={onClear}
        icon={<IconTrash />}
        label="Clear"
        tooltip="Clear all content"
        ariaLabel="Clear all content"
        className="hover:text-red-500"
      />

    </div>
  );
};

export default ActionButtons;
