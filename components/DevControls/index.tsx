import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  DevOverrides,
  DEFAULT_OVERRIDES,
  useDevLayout,
  useDevOverridesSetter,
  useDevActor,
  buildFluidFontSize,
  buildBookmarkY,
  buildDesktopPanelWidth,
} from "./context";
import {
  getNamedGoldenSteps,
  DERIVED_KEYS,
  CUSTOM_DERIVED_KEYS,
  computeDerivedValue,
  computeCustomDerived,
} from "../../constants/spacing";
import { useSelector } from "@xstate/react";

// ─── Light-mode design tokens ────────────────────────────────────────────────

const C = {
  bg: "#FDFBF7",
  bgHover: "#F5F1EA",
  text: "#292524",
  textMuted: "#78716C",
  border: "#E7E5E4",
  accent: "#B45309",
  accentBg: "#B4530912",
  accentBgHover: "#B4530920",
  sliderTrack: "#E7E5E4",
  paper: "#FAF7F2",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
};

// ─── Element highlight mapping (slider key → DOM selector) ──────────────────

const HIGHLIGHT_MAP: Partial<Record<keyof DevOverrides, string>> = {
  contentMaxWidth: 'div[style*="max-width"].mx-auto',
  contentTopPadding: "main",
  contentTopPaddingMd: "main",
  contentTopPaddingLg: "main",
  contentBottomPadding: "main",
  contentPaddingX: "main",
  lineHeight: "textarea",
  letterSpacing: "textarea",
  paragraphSpacing: "textarea",
  fontSizeClampMin: "textarea",
  fontSizeClampMax: "textarea",
  fontSizeClampVw: "textarea",
  fontSizeClampBase: "textarea",
  fontSizeOffset: "textarea",
  topBarPaddingX: '[class*="absolute top-0 right-0"]',
  topBarPaddingY: '[class*="absolute top-0 right-0"]',
  topBarPaddingDesktopX: '[class*="absolute top-0 right-0"]',
  topBarPaddingDesktopY: '[class*="absolute top-0 right-0"]',
  topFadeHeight: '[data-overlap-ignore][class*="top-0"][class*="pointer-events-none"]',
  topFadeWidth: '[data-overlap-ignore][class*="top-0"][class*="pointer-events-none"]',
  sidebarWidth: '[data-testid="document-sidebar"]',
  sidebarPaddingX: '[data-testid="document-sidebar"]',
  sidebarPaddingY: '[data-testid="document-sidebar"]',
  bookmarkYClampMin: '[data-testid="sidebar-bookmark-trigger"]',
  bookmarkYClampVh: '[data-testid="sidebar-bookmark-trigger"]',
  bookmarkYClampMax: '[data-testid="sidebar-bookmark-trigger"]',
  desktopPanelWidthVw: '[data-testid="desktop-syntax-panel"]',
  desktopPanelWidthMin: '[data-testid="desktop-syntax-panel"]',
  desktopPanelPaddingX: '[data-testid="desktop-syntax-panel"]',
  desktopPanelPaddingY: '[data-testid="desktop-syntax-panel"]',
  desktopPanelRight: '[data-testid="desktop-syntax-panel"]',
  hClosedW: '[data-testid="mobile-fold-tab"]',
  hClosedH: '[data-testid="mobile-fold-tab"]',
  hPeekW: '[class*="fixed right-0"][class*="items-end"]',
  hPeekH: '[class*="fixed right-0"][class*="items-end"]',
  hExpandW: '[class*="fixed right-0"][class*="items-end"]',
  hExpandH: '[class*="fixed right-0"][class*="items-end"]',
  hFullW: '[class*="fixed right-0"][class*="items-end"]',
  hFullH: '[class*="fixed right-0"][class*="items-end"]',
  toolbarPaddingX: "footer",
  toolbarPaddingY: "footer",
  toolbarButtonGap: "footer > div > div.flex",
  toolbarIconSize: "footer button",
  toolbarLabelFontSize: "footer button span",
  toolbarFadeWidth: "footer [class*=\"inset-y-0 right-0\"]",
  toolbarDimOpacity: "footer",
  themeSelectorGap: '[class*="flex flex-nowrap"][class*="overflow-x-auto no-scrollbar"]',
  themeSelectorPaddingX: '[class*="flex flex-nowrap"][class*="overflow-x-auto no-scrollbar"]',
  themeSelectorPaddingY: '[class*="flex flex-nowrap"][class*="overflow-x-auto no-scrollbar"]',
  themeDotSize: 'button[data-theme-id]',
  topBarButtonGap: '[class*="pointer-events-auto flex items-center min-h-"]',
  hSpringDuration: '[class*="fixed right-0"][class*="items-end"]',
};

const OUTLINE_CLASS = "__dev-outline";

// Inject highlight style once
if (typeof document !== "undefined") {
  const styleId = "__dev-outline-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .${OUTLINE_CLASS} {
        outline: 2px dashed #B45309 !important;
        outline-offset: 3px !important;
        transition: outline 150ms ease;
      }
    `;
    document.head.appendChild(style);
  }
}

function applyHighlight(sel: string | undefined): () => void {
  if (!sel) return () => {};
  try {
    const el = document.querySelector(sel);
    if (!el) return () => {};
    el.classList.add(OUTLINE_CLASS);
    return () => {
      setTimeout(() => el.classList.remove(OUTLINE_CLASS), 900);
    };
  } catch {
    return () => {};
  }
}

// ─── Slider definition ───────────────────────────────────────────────────────

interface SliderDef {
  key: keyof DevOverrides;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  desc?: string;
}

type CategoryId =
  | "spacing"
  | "typography"
  | "sidebar"
  | "syntax-panel"
  | "harmonica"
  | "toolbar"
  | "theme-selector"
  | "breakpoints";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "spacing", label: "Spacing" },
  { id: "typography", label: "Typography" },
  { id: "sidebar", label: "Sidebar" },
  { id: "syntax-panel", label: "Syntax Panel" },
  { id: "harmonica", label: "Harmonica" },
  { id: "toolbar", label: "Toolbar" },
  { id: "theme-selector", label: "Theme Selector" },
  { id: "breakpoints", label: "Breakpoints" },
];

const SLIDERS: Record<CategoryId, SliderDef[]> = {
  spacing: [
    { key: "baseSpacing", label: "Base Unit", min: 4, max: 24, step: 1, unit: "px", desc: "All padding/gap/margin derive from this" },
    { key: "topBarPaddingX", label: "Top Bar Pad X", min: 4, max: 40, step: 1, unit: "px", desc: "Horizontal padding of top bar (mobile)" },
    { key: "topBarPaddingY", label: "Top Bar Pad Y", min: 4, max: 32, step: 1, unit: "px", desc: "Vertical padding of top bar (mobile)" },
    { key: "topBarPaddingDesktopX", label: "Top Bar Pad X (LG)", min: 4, max: 56, step: 1, unit: "px", desc: "Horizontal padding of top bar (desktop)" },
    { key: "topBarPaddingDesktopY", label: "Top Bar Pad Y (LG)", min: 4, max: 40, step: 1, unit: "px", desc: "Vertical padding of top bar (desktop)" },
    { key: "topFadeHeight", label: "Top Fade H", min: 40, max: 256, step: 8, unit: "px", desc: "Height of top gradient fade" },
    { key: "topFadeWidth", label: "Top Fade W", min: 100, max: 500, step: 20, unit: "px", desc: "Width of top gradient fade" },
    { key: "contentTopPadding", label: "Content Top", min: 20, max: 160, step: 4, unit: "px" },
    { key: "contentTopPaddingMd", label: "Content Top (MD)", min: 20, max: 160, step: 4, unit: "px" },
    { key: "contentTopPaddingLg", label: "Content Top (LG)", min: 20, max: 160, step: 4, unit: "px" },
    { key: "contentBottomPadding", label: "Content Bottom", min: 20, max: 160, step: 4, unit: "px" },
    { key: "contentPaddingX", label: "Content Pad X", min: 4, max: 56, step: 1, unit: "px", desc: "Left/right padding inside content area" },
    { key: "contentMaxWidth", label: "Max Width", min: 280, max: 1400, step: 20, unit: "px" },
  ],
  typography: [
    { key: "fontSizeClampMin", label: "FS Clamp Min", min: 12, max: 32, step: 1, unit: "px" },
    { key: "fontSizeClampMax", label: "FS Clamp Max", min: 16, max: 48, step: 1, unit: "px" },
    { key: "fontSizeClampVw", label: "FS Clamp VW", min: 0.2, max: 4, step: 0.1, unit: "vw" },
    { key: "fontSizeClampBase", label: "FS Clamp Base", min: 4, max: 24, step: 1, unit: "px" },
    { key: "fontSizeOffset", label: "FS Offset", min: -6, max: 12, step: 2, unit: "px" },
    { key: "lineHeight", label: "Line Height", min: 1, max: 3, step: 0.05, unit: "" },
    { key: "letterSpacing", label: "Letter Spacing", min: -0.1, max: 0.5, step: 0.01, unit: "em" },
    { key: "paragraphSpacing", label: "Para Spacing", min: 0, max: 2, step: 0.1, unit: "em" },
  ],
  sidebar: [
    { key: "sidebarWidth", label: "Width", min: 200, max: 420, step: 10, unit: "px" },
    { key: "sidebarPaddingX", label: "Pad X", min: 8, max: 48, step: 4, unit: "px", desc: "Left/right padding inside sidebar" },
    { key: "sidebarPaddingY", label: "Pad Y", min: 8, max: 40, step: 4, unit: "px", desc: "Top/bottom padding inside sidebar" },
    { key: "bookmarkYClampMin", label: "Bookmark Y min", min: 80, max: 320, step: 10, unit: "px" },
    { key: "bookmarkYClampVh", label: "Bookmark Y vh", min: 8, max: 48, step: 2, unit: "vh" },
    { key: "bookmarkYClampMax", label: "Bookmark Y max", min: 120, max: 400, step: 10, unit: "px" },
  ],
  "syntax-panel": [
    { key: "desktopPanelWidthVw", label: "Panel VW", min: 16, max: 48, step: 2, unit: "vw" },
    { key: "desktopPanelWidthMin", label: "Panel Min", min: 240, max: 560, step: 20, unit: "px" },
    { key: "desktopPanelPaddingX", label: "Pad X", min: 8, max: 40, step: 4, unit: "px", desc: "Left/right padding inside panel" },
    { key: "desktopPanelPaddingY", label: "Pad Y", min: 8, max: 40, step: 4, unit: "px", desc: "Top/bottom padding inside panel" },
    { key: "desktopPanelRight", label: "Right Offset", min: 8, max: 56, step: 1, unit: "px", desc: "Distance from right viewport edge" },
  ],
  harmonica: [
    { key: "hClosedW", label: "Closed W", min: 32, max: 96, step: 4, unit: "px" },
    { key: "hClosedH", label: "Closed H", min: 48, max: 128, step: 4, unit: "px" },
    { key: "hPeekW", label: "Peek W", min: 80, max: 220, step: 8, unit: "px" },
    { key: "hPeekH", label: "Peek H", min: 48, max: 128, step: 4, unit: "px" },
    { key: "hExpandW", label: "Expand W", min: 80, max: 220, step: 8, unit: "px" },
    { key: "hExpandH", label: "Expand H", min: 120, max: 280, step: 8, unit: "px" },
    { key: "hFullW", label: "Full W", min: 240, max: 480, step: 16, unit: "px" },
    { key: "hFullH", label: "Full H", min: 320, max: 640, step: 16, unit: "px" },
    { key: "hSpringDuration", label: "Spring ms", min: 100, max: 800, step: 25, unit: "ms" },
  ],
  toolbar: [
    { key: "toolbarPaddingX", label: "Pad X", min: 4, max: 32, step: 2, unit: "px" },
    { key: "toolbarPaddingY", label: "Pad Y", min: 2, max: 24, step: 2, unit: "px" },
    { key: "toolbarButtonGap", label: "Button Gap", min: 2, max: 24, step: 2, unit: "px" },
    { key: "toolbarIconSize", label: "Icon Size", min: 16, max: 40, step: 2, unit: "px" },
    { key: "toolbarLabelFontSize", label: "Label FS", min: 8, max: 18, step: 1, unit: "px" },
    { key: "toolbarFadeWidth", label: "Fade W", min: 16, max: 80, step: 4, unit: "px" },
    { key: "toolbarDimOpacity", label: "Dim Opacity", min: 0.1, max: 1, step: 0.05, unit: "" },
  ],
  "theme-selector": [
    { key: "themeDotSize", label: "Dot Size", min: 24, max: 56, step: 2, unit: "px", desc: "Theme swatch circle diameter" },
    { key: "themeSelectorGap", label: "Dot Gap", min: 4, max: 32, step: 2, unit: "px", desc: "Gap between theme dots" },
    { key: "themeSelectorPaddingX", label: "Pad X", min: 8, max: 40, step: 4, unit: "px", desc: "Horizontal padding of theme row" },
    { key: "themeSelectorPaddingY", label: "Pad Y", min: 4, max: 24, step: 2, unit: "px", desc: "Vertical padding of theme row" },
    { key: "topBarButtonGap", label: "Btn Gap", min: 2, max: 16, step: 2, unit: "px", desc: "Gap between top bar buttons" },
  ],
  breakpoints: [
    { key: "breakpoint1", label: "BP1 (tablet)", min: 480, max: 1024, step: 16, unit: "px", desc: "First breakpoint threshold" },
    { key: "breakpoint2", label: "BP2 (desktop)", min: 768, max: 1440, step: 16, unit: "px", desc: "Second breakpoint threshold" },
  ],
};

// ─── Attention Number (big value display on slider interaction) ──────────────

const AttentionValue: React.FC<{
  label: string;
  value: number;
  unit: string;
  visible: boolean;
}> = ({ label, value, unit, visible }) => {
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return (
    <div
      className="flex flex-col items-center justify-center py-3 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        maxHeight: visible ? "64px" : "0px",
        overflow: "hidden",
      }}
    >
      <span className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
        {label}
      </span>
      <span
        className="text-[28px] font-bold tabular-nums leading-tight"
        style={{ color: C.accent, fontFamily: "ui-monospace, monospace" }}
      >
        {formatted}
        <span className="text-sm font-normal ml-0.5" style={{ color: C.textMuted, fontFamily: "system-ui, sans-serif" }}>
          {unit}
        </span>
      </span>
    </div>
  );
};

// ─── Slider Row ──────────────────────────────────────────────────────────────

function isDerivableKey(k: string): boolean {
  return DERIVED_KEYS.has(k) || CUSTOM_DERIVED_KEYS.has(k);
}

function getDerivedValue(key: string, base: number): number | null {
  if (DERIVED_KEYS.has(key)) return computeDerivedValue(key, base);
  if (CUSTOM_DERIVED_KEYS.has(key)) return computeCustomDerived(key, base);
  return null;
}

const SliderRow: React.FC<{
  def: SliderDef;
  value: number;
  defaultValue: number;
  onChange: (v: number) => void;
  onReset: (() => void) | null;
  derivedValue: number | null;
  isOverridden: boolean;
  onFocus: (label: string, val: number, unit: string) => void;
  onBlur: () => void;
}> = ({ def, value, defaultValue, onChange, onReset, derivedValue, isOverridden, onFocus, onBlur }) => {
  const fillPercent = ((value - def.min) / (def.max - def.min)) * 100;
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const isDirty = value !== defaultValue;
  const isDerived = derivedValue !== null;
  const matchesDerived = isDerived && value === derivedValue;

  return (
    <div className="mb-2.5" title={def.desc}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] truncate mr-2 flex items-center gap-1" style={{ color: C.textMuted }}>
          {isOverridden && (
            <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full text-[8px] font-bold leading-none shrink-0"
              style={{ backgroundColor: C.accentBg, color: C.accent }}
              title="Overridden — value set manually, not derived from base"
            >⟐</span>
          )}
          {matchesDerived && !isOverridden && (
            <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full text-[8px] font-bold leading-none shrink-0"
              style={{ backgroundColor: "#D4C5A9", color: "#8B7355" }}
              title="Derived from base unit via golden ratio"
            >φ</span>
          )}
          {def.label}
        </span>
        <span className="tabular-nums font-mono font-semibold shrink-0 text-sm flex items-center gap-1" style={{ color: C.text }}>
          {formatted}
          <span className="text-[10px] font-normal" style={{ color: C.textMuted }}>
            {def.unit}
          </span>
          {onReset && isOverridden && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none transition-all"
              style={{
                opacity: 0.55,
                color: C.accent,
                backgroundColor: C.accentBg,
              }}
              title="Reset to derived value"
              aria-label={`Reset ${def.label} to derived`}
            >
              ↺
            </button>
          )}
          {!onReset && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(defaultValue);
              }}
              className="w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none transition-all"
              style={{
                opacity: isDirty ? 0.35 : 0,
                pointerEvents: isDirty ? "auto" : "none",
                color: C.accent,
                backgroundColor: C.accentBg,
              }}
              title={`Reset to default: ${defaultValue}${def.unit}`}
              aria-label={`Reset ${def.label} to default`}
            >
              ↺
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={() => onFocus(def.label, value, def.unit)}
        onBlur={onBlur}
        onPointerDown={() => onFocus(def.label, value, def.unit)}
        className="w-full h-1.5 rounded appearance-none cursor-pointer touch-manipulation"
        style={{
          accentColor: C.accent,
          background: `linear-gradient(to right, ${C.accent}60 0%, ${C.accent}60 ${fillPercent}%, ${C.sliderTrack} ${fillPercent}%, ${C.sliderTrack} 100%)`,
        }}
        aria-label={def.label}
      />
    </div>
  );
};

// ─── Slider Group (collapsible) ──────────────────────────────────────────────

const SliderGroup: React.FC<{
  id: CategoryId;
  label: string;
  sliders: SliderDef[];
  values: DevOverrides;
  overriddenKeys: Set<string>;
  onChange: (key: keyof DevOverrides, v: number) => void;
  onResetKey: (key: keyof DevOverrides) => void;
  onSliderFocus: (label: string, val: number, unit: string) => void;
  onSliderBlur: () => void;
}> = ({ id, label, sliders, values, overriddenKeys, onChange, onResetKey, onSliderFocus, onSliderBlur }) => {
  const [open, setOpen] = useState(true);
  const base = values.baseSpacing;
  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors"
        style={{ color: C.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.bgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span
          className="text-[11px] transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold">
          {label}
        </span>
        <span className="text-[10px] tabular-nums ml-auto" style={{ color: C.textMuted, opacity: 0.4 }}>
          {sliders.length}
        </span>
      </button>
      {open && (
        <div className="px-2 pt-1 pb-1">
          {sliders.map((def) => {
            const key = def.key;
            const derivable = isDerivableKey(key);
            const derivedValue = derivable ? getDerivedValue(key, base) : null;
            const isOverridden = derivable && overriddenKeys.has(key);
            return (
              <SliderRow
                key={key}
                def={def}
                value={values[key] as number}
                defaultValue={DEFAULT_OVERRIDES[key] as number}
                onChange={(v) => onChange(key, v)}
                onReset={derivable ? () => onResetKey(key) : null}
                derivedValue={derivedValue}
                isOverridden={isOverridden}
                onFocus={onSliderFocus}
                onBlur={onSliderBlur}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Derived Readout ─────────────────────────────────────────────────────────

const DerivedReadout: React.FC<{ o: DevOverrides }> = ({ o }) => {
  const { xs, sm, md, lg, xl, xxl, xxxl } = getNamedGoldenSteps(o.baseSpacing);
  return (
    <div className="px-2 py-2" style={{ borderTop: `1px solid ${C.border}` }}>
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: C.textMuted, opacity: 0.5 }}>
        Golden Scale (φ = 1.618)
      </span>
      <div className="mt-1.5 space-y-0.5">
        {[
          ["xs", xs, 0],
          ["sm", sm, 1],
          ["md", md, 2],
          ["lg", lg, 3],
          ["xl", xl, 4],
          ["xxl", xxl, 5],
          ["xxxl", xxxl, 6],
        ].map(([label, val, pwr]) => (
          <div key={label} className="flex justify-between text-[10px]">
            <span style={{ color: C.textMuted, opacity: 0.5 }}>
              {label} (φ<sup>{pwr}</sup>)
            </span>
            <span className="font-mono tabular-nums" style={{ color: C.text, opacity: 0.7 }}>
              {val}px
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}50` }}>
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: C.textMuted, opacity: 0.5 }}>
          Builders
        </span>
        <div className="mt-1 space-y-0.5">
          {[
            ["Font Size", buildFluidFontSize(o)],
            ["Bookmark Y", buildBookmarkY(o)],
            ["Desktop Panel", buildDesktopPanelWidth(o)],
            ["Breakpoints", `${o.breakpoint1} / ${o.breakpoint2}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-[10px]">
              <span style={{ color: C.textMuted, opacity: 0.5 }}>{label}</span>
              <span className="font-mono truncate ml-2 max-w-[150px]" style={{ color: C.text, opacity: 0.7 }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── JSON Preview Modal ──────────────────────────────────────────────────────

const JsonPreview: React.FC<{
  overrides: DevOverrides;
  onClose: () => void;
}> = ({ overrides, onClose }) => {
  const json = JSON.stringify(overrides, null, 2);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json).catch(() => {});
  }, [json]);
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-4 max-w-lg w-[90vw] max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: C.bg,
          border: `1px solid ${C.border}`,
          color: C.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>
            Layout JSON
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-[10px] px-2 py-1 rounded-md transition-opacity"
              style={{ backgroundColor: C.accentBg, color: C.accent }}
            >
              Copy
            </button>
            <button
              onClick={onClose}
              className="text-[10px] px-2 py-1 rounded-md transition-opacity"
              style={{ backgroundColor: C.sliderTrack, color: C.textMuted }}
            >
              Close
            </button>
          </div>
        </div>
        <pre
          className="text-[11px] overflow-auto flex-1 rounded-md p-3 font-mono"
          style={{ backgroundColor: C.paper, maxHeight: "60vh", color: C.text }}
        >
          {json}
        </pre>
        <p className="text-[10px] mt-2" style={{ color: C.textMuted, opacity: 0.5 }}>
          Copy this JSON, paste it back via Import, or hand to dev.
        </p>
      </div>
    </div>
  );
};

// ─── Ruler Overlay ───────────────────────────────────────────────────────────

const RulerOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) { setPos(null); return; }
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  if (!active || !pos) return null;

  return (
    <div className="fixed inset-0 z-[180] pointer-events-none">
      <div className="absolute left-0 right-0" style={{ top: pos.y, height: 1, backgroundColor: `${C.accent}50` }} />
      <div className="absolute top-0 bottom-0" style={{ left: pos.x, width: 1, backgroundColor: `${C.accent}50` }} />
      <div
        className="absolute px-2 py-1 rounded text-[10px] font-mono tabular-nums"
        style={{ left: pos.x + 10, top: pos.y + 10, backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}` }}
      >
        {pos.x} × {pos.y}
      </div>
    </div>
  );
};

// ─── Main Panel ──────────────────────────────────────────────────────────────

const DevControlsPanel: React.FC = () => {
  const overrides = useDevLayout();
  const setOverrides = useDevOverridesSetter();
  const actorRef = useDevActor();
  const [showJson, setShowJson] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [attention, setAttention] = useState<{ label: string; value: number; unit: string } | null>(null);
  const attentionTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const highlightCleanup = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = useCallback(
    (key: keyof DevOverrides, value: number) => {
      setOverrides({ [key]: value });
      if (highlightCleanup.current) highlightCleanup.current();
      highlightCleanup.current = applyHighlight(HIGHLIGHT_MAP[key]);
    },
    [setOverrides],
  );

  const handleResetKey = useCallback(
    (key: keyof DevOverrides) => {
      actorRef?.send({ type: "RESET_KEY", key });
    },
    [actorRef],
  );

  // Read overridden keys from machine for slider status indicators
  const overriddenKeys = useSelector(actorRef!, (snap) => snap.context.overriddenKeys);

  const handleSliderFocus = useCallback((label: string, value: number, unit: string) => {
    if (attentionTimer.current) clearTimeout(attentionTimer.current);
    setAttention({ label, value, unit });
  }, []);

  const handleSliderBlur = useCallback(() => {
    attentionTimer.current = setTimeout(() => setAttention(null), 600);
  }, []);

  // Clean up highlight on unmount
  useEffect(() => () => {
    if (highlightCleanup.current) highlightCleanup.current();
  }, []);

  const handleExport = useCallback(() => {
    console.log(
      "%c[DevControls] Layout Overrides%c\n%cCopy this JSON ↓%c",
      "font-weight:bold;font-size:14px;color:#B45309;",
      "",
      "color:#78716C;font-size:11px;",
      "",
      "\n",
      JSON.stringify(overrides, null, 2),
    );
    console.log(overrides);
  }, [overrides]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileLoad = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          actorRef?.send({ type: "IMPORT", overrides: parsed });
        } catch {
          console.warn("[DevControls] Invalid JSON file");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [actorRef],
  );

  const handleReset = useCallback(() => {
    actorRef?.send({ type: "RESET_ALL" });
  }, [actorRef]);

  return (
    <>
      <RulerOverlay active={showRuler} />
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileLoad} />
      {showJson && <JsonPreview overrides={overrides} onClose={() => setShowJson(false)} />}

      <div
        className="fixed right-2 top-2 bottom-2 w-[260px] z-[170] pointer-events-auto rounded-xl flex flex-col overflow-hidden"
        style={{
          fontFamily: "system-ui, sans-serif",
          backgroundColor: C.bg,
          color: C.text,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
        }}
      >
        {/* Attention Number */}
        <AttentionValue
          label={attention?.label ?? ""}
          value={attention?.value ?? 0}
          unit={attention?.unit ?? ""}
          visible={attention !== null}
        />

        {/* Header */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold flex-1" style={{ color: C.textMuted, opacity: 0.6 }}>
            Layout Workbench
          </span>
          <button onClick={() => setShowRuler((p) => !p)} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: showRuler ? C.accentBg : C.sliderTrack, color: showRuler ? C.accent : C.textMuted, opacity: showRuler ? 1 : 0.5 }}
            title="Toggle ruler crosshair">⊞</button>
          <button onClick={handleImport} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted, opacity: 0.5 }} title="Import JSON">↓</button>
          <button onClick={() => setShowJson(true)} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted, opacity: 0.5 }} title="View/export JSON">{ }</button>
          <button onClick={handleExport} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted, opacity: 0.5 }} title="Dump to console.log">◫</button>
          <button onClick={() => actorRef?.send({ type: "TOGGLE" })} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted, opacity: 0.5 }} title="Close">×</button>
        </div>

        {/* Sliders */}
        <div className="flex-1 overflow-y-auto px-1 py-1" style={{ overscrollBehavior: "contain" }}>
          {CATEGORIES.map((cat) => (
            <SliderGroup
              key={cat.id}
              id={cat.id}
              label={cat.label}
              sliders={SLIDERS[cat.id]}
              values={overrides}
              overriddenKeys={overriddenKeys}
              onChange={handleSliderChange}
              onResetKey={handleResetKey}
              onSliderFocus={handleSliderFocus}
              onSliderBlur={handleSliderBlur}
            />
          ))}
          <DerivedReadout o={overrides} />
        </div>

        {/* Footer */}
        <div className="px-3 py-2 shrink-0 flex items-center gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleReset} className="text-[10px] px-2 py-1 rounded-md transition-colors flex-1"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted }}>
            Reset to Defaults
          </button>
          <button onClick={handleExport} className="text-[10px] px-2 py-1 rounded-md transition-colors"
            style={{ backgroundColor: C.accentBg, color: C.accent }}>
            console.log
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Toggle Button (for top bar) ─────────────────────────────────────────────

export const DevToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation p-1.5 rounded-xl hover:bg-current/5 transition-all duration-200"
    style={{ color: "#B45309", fontFamily: "system-ui, sans-serif" }}
    title="Toggle Dev Layout Workbench"
    aria-label="Toggle Dev Layout Workbench"
  >
    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
      DEV
    </span>
  </button>
);

export default DevControlsPanel;
