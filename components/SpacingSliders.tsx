import React, { useState, useRef, useEffect, useCallback } from "react";
import { RisoTheme } from "../types";

interface SpacingSlidersProps {
  theme: RisoTheme;
  lineHeight: number;
  onLineHeightChange: (v: number) => void;
}

const LH_PRESETS = [
  { value: 1.3, label: "Tight" },
  { value: 1.6, label: "Normal" },
  { value: 2.0, label: "Relaxed" },
];

function closestPreset(value: number, presets: typeof LH_PRESETS) {
  let best = presets[0];
  let bestDist = Math.abs(value - best.value);
  for (const p of presets) {
    const d = Math.abs(value - p.value);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

const SpacingSliders: React.FC<SpacingSlidersProps> = ({
  theme,
  lineHeight,
  onLineHeightChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when tapping outside
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    // Delay listener to avoid the opening tap from immediately closing
    const id = setTimeout(() => {
      document.addEventListener("pointerdown", handler);
    }, 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("pointerdown", handler);
    };
  }, [expanded]);

  const lhPreset = closestPreset(lineHeight, LH_PRESETS);

  const roundStep = useCallback((v: number) => Math.round(v * 10) / 10, []);

  return (
    <div
      ref={panelRef}
      className="fixed left-0 z-[70] flex items-center"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      {/* Expanded panel */}
      <div
        className="flex flex-col items-center gap-4 rounded-r-xl transition-all duration-200 overflow-hidden"
        style={{
          width: expanded ? 60 : 0,
          opacity: expanded ? 1 : 0,
          padding: expanded ? "16px 8px" : "16px 0",
          backgroundColor: `${theme.background}CC`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRight: expanded ? `1px solid ${theme.text}15` : "none",
          borderTop: expanded ? `1px solid ${theme.text}15` : "none",
          borderBottom: expanded ? `1px solid ${theme.text}15` : "none",
          pointerEvents: expanded ? "auto" : "none",
        }}
      >
        {/* Line Height slider */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: theme.text, opacity: 0.5 }}
          >
            LH
          </span>
          <input
            type="range"
            min={1.2}
            max={2.4}
            step={0.1}
            value={lineHeight}
            onChange={(e) => onLineHeightChange(roundStep(Number(e.target.value)))}
            className="spacing-slider"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              height: 80,
              width: 20,
              accentColor: theme.accent,
            }}
          />
          <span
            className="text-[10px] font-medium tabular-nums"
            style={{ color: theme.text, opacity: 0.7 }}
          >
            {lineHeight.toFixed(1)}
          </span>
          <span
            className="text-[8px] uppercase tracking-wider"
            style={{ color: theme.text, opacity: 0.35 }}
          >
            {lhPreset.label}
          </span>
        </div>
      </div>

      {/* Toggle pill / tab */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center justify-center rounded-r-lg transition-all duration-200 touch-manipulation"
        style={{
          width: 24,
          height: 48,
          backgroundColor: `${theme.background}B3`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRight: `1px solid ${theme.text}15`,
          borderTop: `1px solid ${theme.text}15`,
          borderBottom: `1px solid ${theme.text}15`,
          color: theme.text,
          opacity: expanded ? 0.8 : 0.4,
        }}
        aria-label="Toggle spacing controls"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Line spacing icon */}
          <line x1="21" y1="6" x2="9" y2="6" />
          <line x1="21" y1="12" x2="9" y2="12" />
          <line x1="21" y1="18" x2="9" y2="18" />
          <polyline points="4 6 4 18" />
          <polyline points="2 8 4 6 6 8" />
          <polyline points="2 16 4 18 6 16" />
        </svg>
      </button>
    </div>
  );
};

export default SpacingSliders;
