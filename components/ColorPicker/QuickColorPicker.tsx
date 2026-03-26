import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ColorEditTarget, RisoTheme, SyntaxColorKey } from "../../types";
import { isValidHex } from "../../types";
import HexInput from "./HexInput";
import TouchButton from "../TouchButton";

interface QuickColorPickerProps {
  target: ColorEditTarget;
  currentColor: string;
  anchorEl: HTMLElement;
  theme: RisoTheme;
  onSetColor: (target: ColorEditTarget, color: string) => void;
  onOpenFull: (target: ColorEditTarget) => void;
  onClose: () => void;
}

/** Collect 6 contextual preset swatches from the current theme */
function getPresetSwatches(theme: RisoTheme, target: ColorEditTarget): string[] {
  if (target.type === "syntax") {
    // Other syntax colours as presets (excluding current)
    return Object.entries(theme.highlight)
      .filter(([key]) => key !== target.key)
      .slice(0, 6)
      .map(([, v]) => v);
  }
  if (target.type === "rhyme" && theme.rhymeColors) {
    return theme.rhymeColors
      .filter((_, i) => i !== target.index)
      .slice(0, 6);
  }
  // Editor colour fallback
  return [theme.accent, theme.text, theme.background, theme.cursor].slice(0, 6);
}

/** Label for a ColorEditTarget */
function targetLabel(target: ColorEditTarget): string {
  if (target.type === "syntax") {
    const labels: Record<SyntaxColorKey, string> = {
      noun: "Nouns",
      verb: "Verbs",
      adjective: "Adjectives",
      adverb: "Adverbs",
      pronoun: "Pronouns",
      preposition: "Prepositions",
      conjunction: "Conjunctions",
      article: "Articles",
      interjection: "Interjections",
      url: "URLs",
      number: "Numbers",
      hashtag: "Hashtags",
    };
    return labels[target.key];
  }
  if (target.type === "rhyme") {
    return `Song Color ${target.index + 1}`;
  }
  return target.key.charAt(0).toUpperCase() + target.key.slice(1);
}

/**
 * Minimal inline popover for quick colour editing.
 *
 * Appears near `anchorEl` with flip logic (above/below).
 * Contains: label, current swatch, 6 contextual presets,
 * native <input type="color">, hex input, and a "More..." link.
 */
const QuickColorPicker: React.FC<QuickColorPickerProps> = ({
  target,
  currentColor,
  anchorEl,
  theme,
  onSetColor,
  onOpenFull,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; flipUp: boolean }>({
    top: 0,
    left: 0,
    flipUp: false,
  });

  const presets = getPresetSwatches(theme, target);

  // Position relative to anchor
  useEffect(() => {
    const rect = anchorEl.getBoundingClientRect();
    const popoverH = 180; // estimate
    const flipUp = rect.bottom + popoverH > window.innerHeight;

    setPos({
      top: flipUp ? rect.top - popoverH - 8 : rect.bottom + 8,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 240)),
      flipUp,
    });
  }, [anchorEl]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Delay to avoid the triggering pointerup from closing immediately
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, anchorEl]);

  const handleColorChange = useCallback(
    (color: string) => {
      if (isValidHex(color)) {
        onSetColor(target, color);
      }
    },
    [target, onSetColor],
  );

  return (
    <div
      ref={popoverRef}
      className="fixed z-[200] animate-quick-picker-in"
      style={{
        top: pos.top,
        left: pos.left,
        transformOrigin: pos.flipUp ? "bottom left" : "top left",
      }}
    >
      <div
        className="rounded-xl p-3 shadow-lg border"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          borderColor: `${theme.text}15`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)",
          minWidth: "220px",
          maxWidth: "260px",
        }}
      >
        {/* Label */}
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] opacity-50 mb-2">
          {targetLabel(target)}
        </div>

        {/* Current + native picker */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 border"
            style={{
              backgroundColor: currentColor,
              borderColor: `${theme.text}20`,
            }}
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
            style={{ minWidth: "32px", minHeight: "32px" }}
          />
          <HexInput value={currentColor} onChange={handleColorChange} />
        </div>

        {/* Preset swatches */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {presets.map((preset, i) => (
            <button
              key={`${preset}-${i}`}
              type="button"
              onClick={() => handleColorChange(preset)}
              className="rounded-md transition-transform hover:scale-110 active:scale-95"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: preset,
                boxShadow:
                  currentColor.toLowerCase() === preset.toLowerCase()
                    ? `0 0 0 2px ${theme.background}, 0 0 0 3px ${theme.text}40`
                    : "none",
              }}
              title={preset}
            />
          ))}
        </div>

        {/* More link */}
        <TouchButton
          onClick={() => {
            onClose();
            onOpenFull(target);
          }}
          className="text-[11px] w-full py-1.5 rounded-lg transition-all opacity-60 hover:opacity-100 text-center"
          style={{
            backgroundColor: `${theme.text}08`,
            border: `1px solid ${theme.text}12`,
          }}
        >
          More options...
        </TouchButton>
      </div>
    </div>
  );
};

export default QuickColorPicker;
