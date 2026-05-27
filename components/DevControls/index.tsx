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
  | "theme-selector";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "spacing", label: "Spacing" },
  { id: "typography", label: "Typography" },
  { id: "sidebar", label: "Sidebar" },
  { id: "syntax-panel", label: "Syntax Panel" },
  { id: "harmonica", label: "Harmonica" },
  { id: "toolbar", label: "Toolbar" },
  { id: "theme-selector", label: "Theme Selector" },
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



const SliderRow: React.FC<{
  def: SliderDef;
  value: number;
  defaultValue: number;
  onChange: (v: number) => void;
  onFocus: (label: string, val: number, unit: string) => void;
  onBlur: () => void;
}> = ({ def, value, defaultValue, onChange, onFocus, onBlur }) => {
  const fillPercent = ((value - def.min) / (def.max - def.min)) * 100;
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const isDirty = value !== defaultValue;

  return (
    <div className="mb-2.5" title={def.desc}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] truncate mr-2 flex items-center gap-1" style={{ color: C.textMuted }}>
          {def.label}
        </span>
        <span className="tabular-nums font-mono font-semibold shrink-0 text-sm flex items-center gap-1" style={{ color: C.text }}>
          {formatted}
          <span className="text-[10px] font-normal" style={{ color: C.textMuted }}>
            {def.unit}
          </span>
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
  onChange: (key: keyof DevOverrides, v: number) => void;
  onSliderFocus: (label: string, val: number, unit: string) => void;
  onSliderBlur: () => void;
}> = ({ id, label, sliders, values, onChange, onSliderFocus, onSliderBlur }) => {
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
            return (
              <SliderRow
                key={key}
                def={def}
                value={values[key] as number}
                defaultValue={DEFAULT_OVERRIDES[key] as number}
                onChange={(v) => onChange(key, v)}
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
// (Removed derived readout as requested by user)



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
  const [attention, setAttention] = useState<{ label: string; value: number; unit: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("spacing");
  const [copied, setCopied] = useState(false);
  const attentionTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const highlightCleanup = useRef<(() => void) | null>(null);

  const handleSliderChange = useCallback(
    (key: keyof DevOverrides, value: number) => {
      setOverrides({ [key]: value });
      if (highlightCleanup.current) highlightCleanup.current();
      highlightCleanup.current = applyHighlight(HIGHLIGHT_MAP[key]);
    },
    [setOverrides],
  );



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
    navigator.clipboard.writeText(JSON.stringify(overrides, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [overrides]);

  const handleReset = useCallback(() => {
    actorRef?.send({ type: "RESET_ALL" });
  }, [actorRef]);

  return (
    <>

      <div
        className="fixed z-[170] pointer-events-auto rounded-xl flex flex-col overflow-hidden right-2 bottom-2 md:top-2 top-[20vh] w-[calc(100vw-16px)] md:w-[260px]"
        style={{
          fontFamily: "system-ui, sans-serif",
          backgroundColor: C.bg,
          color: C.text,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
          paddingBottom: "env(safe-area-inset-bottom)",
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
          <button onClick={() => actorRef?.send({ type: "TOGGLE" })} className="text-[10px] px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted, opacity: 0.5 }} title="Close">×</button>
        </div>

        {/* Category Tabs (Horizontal Scroll) */}
        <div className="flex overflow-x-auto no-scrollbar shrink-0 px-2 py-2 gap-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: activeCategory === cat.id ? C.text : "transparent",
                color: activeCategory === cat.id ? C.bg : C.textMuted,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="flex-1 overflow-y-auto px-1 py-2" style={{ overscrollBehavior: "contain" }}>
          <SliderGroup
            id={activeCategory}
            label={CATEGORIES.find(c => c.id === activeCategory)?.label || ""}
            sliders={SLIDERS[activeCategory]}
            values={overrides}
            onChange={handleSliderChange}
            onSliderFocus={handleSliderFocus}
            onSliderBlur={handleSliderBlur}
          />
        </div>

        {/* Footer */}
        <div className="px-3 py-2 shrink-0 flex items-center gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleReset} className="text-[10px] px-2 py-1 rounded-md transition-colors flex-1"
            style={{ backgroundColor: C.sliderTrack, color: C.textMuted }}>
            Reset
          </button>
          <button onClick={handleExport} className="text-[10px] px-2 py-1 rounded-md transition-colors flex-1"
            style={{ backgroundColor: C.accentBg, color: C.accent }}>
            {copied ? "Copied!" : "Export JSON"}
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
