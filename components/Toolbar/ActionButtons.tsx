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
      style={{ color: iconColor }}
    >
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
        onClick={onCycleFocusMode}
        active={focusMode !== "none"}
        disabled={viewMode === "preview"}
        icon={<IconFocus />}
        label={FOCUS_MODE_LABELS[focusMode]}
        tooltip={`Focus mode: ${focusMode === "none" ? "Off" : focusMode} (click to cycle)`}
        shortcut={mod ? `${mod}F` : undefined}
        ariaLabel="Cycle focus mode"
        className={focusMode !== "none" ? "!opacity-100" : ""}
        style={focusMode !== "none" ? { color: theme.accent } : undefined}
      />

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
