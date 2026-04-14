import React from "react";

interface ToggleButtonProps {
  /** Binary on/off state */
  pressed: boolean;
  onToggle: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Accessible label — announced as "Nouns on" / "Nouns off" */
  label: string;
  icon: React.ReactNode;
  /** Accent color when pressed (e.g. theme.highlight.noun) */
  accentColor: string;
  /** Optional shortcut hint rendered below the icon */
  shortcut?: string | number;
  /** Highlight this button with an outline (solo mode) */
  soloed?: boolean;
  /** Another button is soloed — push this one far back */
  dimmed?: boolean;
}

/**
 * Accessible toggle button with three non-colour ON cues:
 *   ON  → accent fill + accent bottom bar + full opacity
 *   OFF → transparent, no bar, low opacity
 *   DIMMED → near-invisible (another button is "soloed")
 *   SOLOED → accent outline ring
 */
const ToggleButton: React.FC<ToggleButtonProps> = ({
  pressed,
  onToggle,
  onDoubleClick,
  onContextMenu,
  label,
  icon,
  accentColor,
  shortcut,
  soloed,
  dimmed,
}) => {
  const isOn = pressed && !dimmed;

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${label} ${pressed ? "on" : "off"}`}
      onClick={onToggle}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className="relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl touch-manipulation transition-[opacity,transform,outline] duration-150 active:scale-95 hover:bg-current/5 opacity-60 hover:opacity-100"
      style={{
        color: isOn ? accentColor : "inherit",
        opacity: dimmed ? 0.12 : isOn ? 1 : undefined,
        outline: soloed ? `2px solid ${accentColor}` : "none",
        outlineOffset: "2px",
      }}
    >
      <span className="flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>

      {shortcut != null && (
        <span
          className="text-[9px] font-bold tabular-nums leading-none tracking-wide"
          aria-hidden="true"
        >
          {shortcut}
        </span>
      )}

      {/* Bottom bar — animates in/out to reinforce ON state without relying on colour alone */}
      <span
        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-150"
        style={{
          width: isOn ? "55%" : "0%",
          backgroundColor: accentColor,
          opacity: isOn ? 1 : 0,
        }}
        aria-hidden="true"
      />
    </button>
  );
};

export default ToggleButton;
