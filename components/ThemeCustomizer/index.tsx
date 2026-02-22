import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { RisoTheme, ColorSystemMode, ColorHarmonyType } from "../../types";
import {
  BUILD_IDENTITY,
  BUILD_WORDISM,
  FONT_OPTIONS,
  FontId,
  THEMES,
} from "../../constants";
import {
  getContrastRatio,
  formatContrastRatio,
} from "../../utils/colorContrast";
import { generateHarmonyColors, generateOklchHarmony } from "../../utils/colorHarmony";
import HexInput from "../ColorPicker/HexInput";
import TouchButton from "../TouchButton";

// Reset icon component
const IconReset: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RisoTheme;
  hasCustomizations: boolean;
  onSetColor: (path: string, color: string) => void;
  onResetToPreset: () => void;
  onResetColor?: (path: string) => void;
  isColorCustomized?: (path: string) => boolean;
  currentFontId: FontId;
  onFontChange: (fontId: FontId) => void;
  onSavePalette?: (name: string) => void;
  hiddenThemeIds?: string[];
  onToggleThemeVisibility?: (id: string) => void;
  utf8DisplayEnabled: boolean;
  onToggleUtf8Display: (enabled: boolean) => void;
  colorSystemMode?: ColorSystemMode;
  onColorSystemModeChange?: (mode: ColorSystemMode) => void;
  colorHarmonyType?: ColorHarmonyType;
  onColorHarmonyTypeChange?: (type: ColorHarmonyType) => void;
  colorBaseHue?: number;
  onColorBaseHueChange?: (hue: number) => void;
  themeOrder?: string[];
  onReorderThemes?: (fromIndex: number, toIndex: number) => void;
  rhymeColors?: string[];
  onSetRhymeColor?: (index: number, color: string) => void;
  onResetRhymeColor?: (index: number) => void;
  isRhymeColorCustomized?: (index: number) => boolean;
}

const RHYME_COLOR_LABELS = [
  "Red", "Blue", "Green", "Orange", "Purple", "Teal", "Pink", "Yellow",
];

const RHYME_PRESETS: { name: string; colors: string[] }[] = [
  { name: "Default", colors: ["#de6457","#2895e7","#859b00","#d86d28","#917be5","#00ac9e","#d3629c","#b78700"] },
  { name: "Billboard", colors: ["#E53935","#1E88E5","#43A047","#FB8C00","#8E24AA","#00ACC1","#D81B60","#FFD600"] },
  { name: "Neon", colors: ["#FF006E","#3A86FF","#8AC926","#FF5400","#9B5DE5","#00F5D4","#F72585","#FFBE0B"] },
  { name: "Earth", colors: ["#A0522D","#4682B4","#6B8E23","#CD853F","#708090","#2E8B57","#BC8F8F","#DAA520"] },
  { name: "Pastel", colors: ["#FF9AA2","#B5EAD7","#C7CEEA","#FFDAC1","#E2B4BD","#9DE0D0","#FFB7B2","#F3E8C0"] },
];

const WORD_TYPE_LABELS: {
  key: keyof RisoTheme["highlight"];
  label: string;
  short: string;
}[] = [
  { key: "noun", label: "Nouns", short: "Noun" },
  { key: "verb", label: "Verbs", short: "Verb" },
  { key: "adjective", label: "Adjectives", short: "Adj" },
  { key: "adverb", label: "Adverbs", short: "Adv" },
  { key: "pronoun", label: "Pronouns", short: "Pron" },
  { key: "preposition", label: "Prepositions", short: "Prep" },
  { key: "conjunction", label: "Conjunctions", short: "Conj" },
  { key: "article", label: "Articles", short: "Art" },
  { key: "interjection", label: "Interjections", short: "Intj" },
  { key: "url", label: "URLs", short: "URL" },
  { key: "number", label: "Numbers", short: "Num" },
  { key: "hashtag", label: "Hashtags", short: "#Tag" },
];

const MIN_CONTRAST_RATIO = 3; // WCAG AA for large text / UI components

type TabId = "colors" | "typography" | "themes" | "display";

const TABS: { id: TabId; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Type" },
  { id: "themes", label: "Themes" },
  { id: "display", label: "Display" },
];

const HARMONY_OPTIONS: { value: ColorHarmonyType; label: string }[] = [
  { value: "complementary", label: "Complementary" },
  { value: "analogous", label: "Analogous" },
  { value: "triadic", label: "Triadic" },
  { value: "split-complementary", label: "Split" },
  { value: "tetradic", label: "Tetradic" },
];

/** Compact single-row color editor with 44px touch target */
const CompactColorRow: React.FC<{
  label: string;
  color: string;
  path: string;
  bgColor: string;
  showContrast?: boolean;
  isCustomized?: boolean;
  onSetColor: (path: string, color: string) => void;
  onResetColor?: (path: string) => void;
}> = ({
  label,
  color,
  path,
  bgColor,
  showContrast = false,
  isCustomized = false,
  onSetColor,
  onResetColor,
}) => {
  const ratio = showContrast ? getContrastRatio(color, bgColor) : null;
  const lowContrast = ratio !== null && ratio < MIN_CONTRAST_RATIO;

  return (
    <div className="flex items-center gap-2" style={{ minHeight: "44px" }}>
      <span className="text-xs uppercase tracking-wide opacity-70 w-[72px] flex-shrink-0 truncate">
        {label}
      </span>
      <input
        type="color"
        value={color}
        onChange={(e) => onSetColor(path, e.target.value)}
        className="cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
        style={{
          minWidth: "44px",
          minHeight: "44px",
          width: "44px",
          height: "44px",
        }}
      />
      <HexInput value={color} onChange={(c) => onSetColor(path, c)} />
      {lowContrast && (
        <span
          className="px-1 py-0.5 text-[9px] font-medium rounded whitespace-nowrap flex-shrink-0"
          style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
          title={`Contrast ${formatContrastRatio(ratio!)} below ${MIN_CONTRAST_RATIO}:1`}
        >
          !
        </span>
      )}
      {onResetColor && (
        <TouchButton
          onClick={() => onResetColor(path)}
          disabled={!isCustomized}
          className={`p-2 rounded transition-all flex-shrink-0 ${
            isCustomized
              ? "opacity-60 hover:opacity-100"
              : "opacity-20 cursor-not-allowed"
          }`}
          title={
            isCustomized
              ? `Reset ${label.toLowerCase()}`
              : `${label} is using preset value`
          }
        >
          <IconReset size={12} />
        </TouchButton>
      )}
    </div>
  );
};

const THEME_ITEM_HEIGHT = 52;
const THEME_LONG_PRESS_MS = 400;

/** Draggable themes list for the Themes tab */
const ThemesTab: React.FC<{
  theme: RisoTheme;
  hiddenThemeIds: string[];
  onToggleThemeVisibility: (id: string) => void;
  themeOrder?: string[];
  onReorderThemes?: (fromIndex: number, toIndex: number) => void;
}> = ({ theme, hiddenThemeIds, onToggleThemeVisibility, themeOrder, onReorderThemes }) => {
  // Ordered themes list
  const orderedThemeList = useMemo(() => {
    if (!themeOrder) return THEMES;
    return [...THEMES].sort((a, b) => {
      const ia = themeOrder.indexOf(a.id);
      const ib = themeOrder.indexOf(b.id);
      return ia - ib;
    });
  }, [themeOrder]);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [itemPositions, setItemPositions] = useState<Record<string, number>>({});
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartYRef = useRef(0);
  const orderRef = useRef(orderedThemeList.map((t) => t.id));

  // Keep orderRef in sync
  useEffect(() => {
    orderRef.current = orderedThemeList.map((t) => t.id);
  }, [orderedThemeList]);

  // Initialize positions
  useEffect(() => {
    const pos: Record<string, number> = {};
    orderedThemeList.forEach((t, i) => {
      pos[t.id] = i * THEME_ITEM_HEIGHT;
    });
    setItemPositions(pos);
  }, [orderedThemeList]);

  const handleDragStart = useCallback((id: string, clientY: number) => {
    setDraggedId(id);
    dragStartYRef.current = clientY;
    setDragOffset(0);
    const pos: Record<string, number> = {};
    orderRef.current.forEach((tid, i) => {
      pos[tid] = i * THEME_ITEM_HEIGHT;
    });
    setItemPositions(pos);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!draggedId || !onReorderThemes) return;
    const offset = clientY - dragStartYRef.current;
    setDragOffset(offset);

    const order = orderRef.current;
    const currentIndex = order.indexOf(draggedId);
    const newPosition = currentIndex * THEME_ITEM_HEIGHT + offset;
    const newIndex = Math.max(0, Math.min(order.length - 1, Math.round(newPosition / THEME_ITEM_HEIGHT)));

    if (newIndex !== currentIndex) {
      onReorderThemes(currentIndex, newIndex);
      // Synchronously update orderRef so the next drag frame reads the correct order
      const updated = [...orderRef.current];
      updated.splice(currentIndex, 1);
      updated.splice(newIndex, 0, draggedId);
      orderRef.current = updated;
      dragStartYRef.current = clientY - (newIndex * THEME_ITEM_HEIGHT - currentIndex * THEME_ITEM_HEIGHT) + (offset - (newIndex - currentIndex) * THEME_ITEM_HEIGHT);
    }

    // Update positions with collision effect
    const pos: Record<string, number> = {};
    const updatedOrder = orderRef.current;
    const draggedIndex = updatedOrder.indexOf(draggedId);
    const draggedPosition = draggedIndex * THEME_ITEM_HEIGHT + offset;

    updatedOrder.forEach((tid, index) => {
      if (tid === draggedId) {
        pos[tid] = draggedPosition;
      } else {
        const basePos = index * THEME_ITEM_HEIGHT;
        const itemCenter = basePos + THEME_ITEM_HEIGHT / 2;
        const draggedCenter = draggedPosition + THEME_ITEM_HEIGHT / 2;
        const dist = itemCenter - draggedCenter;
        const absDist = Math.abs(dist);
        const collisionRadius = THEME_ITEM_HEIGHT * 1.5;
        if (absDist < collisionRadius) {
          const pushStrength = (1 - absDist / collisionRadius) * 16;
          pos[tid] = basePos + (dist > 0 ? 1 : -1) * pushStrength;
        } else {
          pos[tid] = basePos;
        }
      }
    });
    setItemPositions(pos);
  }, [draggedId, onReorderThemes]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOffset(0);
    const pos: Record<string, number> = {};
    orderRef.current.forEach((tid, i) => {
      pos[tid] = i * THEME_ITEM_HEIGHT;
    });
    setItemPositions(pos);
  }, []);

  const handlePointerDown = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!onReorderThemes) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = clientY;
    longPressRef.current = setTimeout(() => {
      handleDragStart(id, clientY);
    }, THEME_LONG_PRESS_MS);
  }, [onReorderThemes, handleDragStart]);

  const handlePointerUp = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (draggedId) handleDragEnd();
  }, [draggedId, handleDragEnd]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggedId) {
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      handleDragMove(clientY);
    } else if (longPressRef.current) {
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (Math.abs(clientY - dragStartYRef.current) > 10) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
    }
  }, [draggedId, handleDragMove]);

  // Global listeners for drag
  useEffect(() => {
    if (!draggedId) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      handleDragMove(clientY);
    };
    const handleUp = () => handleDragEnd();
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };
  }, [draggedId, handleDragMove, handleDragEnd]);

  useEffect(() => {
    return () => {
      if (longPressRef.current) clearTimeout(longPressRef.current);
    };
  }, []);

  return (
    <section className="py-4">
      <h3 className="text-xs font-medium uppercase tracking-widest mb-1 opacity-50">
        Visible Presets
      </h3>
      {onReorderThemes && !draggedId && (
        <p className="text-[10px] opacity-30 italic mb-2" style={{ color: theme.text }}>
          Hold to reorder
        </p>
      )}
      <div
        className="relative"
        style={{ height: orderedThemeList.length * THEME_ITEM_HEIGHT }}
      >
        {orderedThemeList.map((t, index) => {
          const isHidden = hiddenThemeIds.includes(t.id);
          const isDragging = draggedId === t.id;
          const basePos = index * THEME_ITEM_HEIGHT;
          const currentPos = itemPositions[t.id] ?? basePos;
          const displacement = currentPos - basePos;
          const isBeingPushed = !isDragging && draggedId && Math.abs(displacement) > 2;

          return (
            <div
              key={t.id}
              className={`absolute left-0 right-0 select-none ${isDragging ? "z-50 cursor-grabbing" : "z-10 cursor-grab"}`}
              style={{
                height: THEME_ITEM_HEIGHT,
                transform: `translateY(${currentPos}px) scale(${isDragging ? 1.03 : 1})`,
                transition: isDragging
                  ? "box-shadow 150ms ease, scale 150ms ease"
                  : "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease",
                backgroundColor: isDragging ? theme.background : "transparent",
                boxShadow: isDragging
                  ? "0 8px 30px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)"
                  : isBeingPushed
                    ? "0 2px 8px rgba(0,0,0,0.05)"
                    : "none",
                borderRadius: "8px",
                border: isDragging ? `1px solid ${theme.accent}30` : "1px solid transparent",
              }}
              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(t.id, e); }}
              onTouchStart={(e) => handlePointerDown(t.id, e)}
              onMouseMove={handlePointerMove}
              onTouchMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchEnd={handlePointerUp}
            >
              <label
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-current/5 cursor-pointer transition-colors h-full"
                style={{ minHeight: "44px" }}
                onClick={(e) => {
                  if (isDragging) { e.preventDefault(); return; }
                }}
              >
                {/* Grip handle */}
                {onReorderThemes && (
                  <svg
                    width="10"
                    height="14"
                    viewBox="0 0 10 14"
                    className="flex-shrink-0 transition-opacity"
                    style={{
                      opacity: isDragging ? 1 : 0.25,
                      color: isDragging ? theme.accent : theme.text,
                    }}
                  >
                    <circle cx="3" cy="2" r="1.2" fill="currentColor"/>
                    <circle cx="7" cy="2" r="1.2" fill="currentColor"/>
                    <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
                    <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
                    <circle cx="3" cy="12" r="1.2" fill="currentColor"/>
                    <circle cx="7" cy="12" r="1.2" fill="currentColor"/>
                  </svg>
                )}
                <input
                  type="checkbox"
                  checked={!isHidden}
                  onChange={() => onToggleThemeVisibility(t.id)}
                  className="w-4 h-4 rounded border-2 border-current/30 bg-transparent accent-current flex-shrink-0"
                />
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 border"
                  style={{
                    backgroundColor: t.accent,
                    borderColor: `${t.text}30`,
                  }}
                />
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-sm font-medium">{t.name}</span>
                  <div
                    className="flex flex-wrap ml-auto"
                    style={{ gap: "1px", maxWidth: "48px" }}
                  >
                    {WORD_TYPE_LABELS.map(({ key }) => (
                      <span
                        key={key}
                        className="rounded-full"
                        style={{
                          width: "6px",
                          height: "6px",
                          backgroundColor: t.highlight[key as keyof typeof t.highlight],
                        }}
                      />
                    ))}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  theme,
  hasCustomizations,
  onSetColor,
  onResetToPreset,
  onResetColor,
  isColorCustomized,
  currentFontId,
  onFontChange,
  onSavePalette,
  hiddenThemeIds = [],
  onToggleThemeVisibility,
  utf8DisplayEnabled,
  onToggleUtf8Display,
  colorSystemMode = "free",
  onColorSystemModeChange,
  colorHarmonyType = "analogous",
  onColorHarmonyTypeChange,
  colorBaseHue = 220,
  onColorBaseHueChange,
  themeOrder,
  onReorderThemes,
  rhymeColors,
  onSetRhymeColor,
  onResetRhymeColor,
  isRhymeColorCustomized,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("colors");
  const [paletteName, setPaletteName] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [savedPaletteName, setSavedPaletteName] = useState("");

  // Live harmony preview — recomputes reactively as hue slider moves
  const harmonyPreview = useMemo(() => {
    if (colorSystemMode !== "system") return null;
    return generateHarmonyColors(colorBaseHue, colorHarmonyType, theme.background);
  }, [colorSystemMode, colorBaseHue, colorHarmonyType, theme.background]);

  if (!isOpen) return null;

  const hasColorCustomizations = isColorCustomized
    ? [
        "background",
        "text",
        "cursor",
        "selection",
        "noun",
        "verb",
        "adjective",
        "adverb",
        "pronoun",
        "preposition",
        "conjunction",
        "article",
        "interjection",
        "url",
        "number",
        "hashtag",
      ].some((path) => isColorCustomized(path as any))
    : hasCustomizations;

  const handleSavePalette = () => {
    if (paletteName.trim() && onSavePalette) {
      const name = paletteName.trim();
      onSavePalette(name);
      setSavedPaletteName(name);
      setPaletteName("");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4000);
    }
  };

  const handleApplyHarmony = () => {
    if (!onColorSystemModeChange) return;
    const colors = generateHarmonyColors(
      colorBaseHue,
      colorHarmonyType,
      theme.background,
    );
    for (const [key, value] of Object.entries(colors)) {
      onSetColor(key, value);
    }
  };

  const checkCustomized = (path: string) => isColorCustomized?.(path) ?? false;
  const selectedFont =
    FONT_OPTIONS.find((f) => f.id === currentFontId) || FONT_OPTIONS[0];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-current/50 z-[100]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[101] flex flex-col"
        data-testid="theme-customizer-panel"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-current/10 flex-shrink-0"
          style={{ backgroundColor: theme.background }}
        >
          <h2 className="text-lg font-bold">Customize</h2>
          <TouchButton
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-current/10 transition-colors"
            title="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </TouchButton>
        </div>

        {/* Active Preview Swatch */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-current/10 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 border"
            style={{
              backgroundColor: theme.background,
              borderColor: `${theme.text}20`,
            }}
          >
            <div className="w-full h-full rounded-xl flex items-center justify-center">
              <span
                className="text-xs font-bold"
                style={{ color: theme.accent }}
              >
                Aa
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {WORD_TYPE_LABELS.map(({ key }) => (
              <span
                key={key}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: theme.highlight[key] }}
              />
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-current/10 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-all relative"
              style={{
                color: activeTab === tab.id ? theme.accent : theme.text,
                opacity: activeTab === tab.id ? 1 : 0.5,
                minHeight: "44px",
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-1">
          {/* Colors Tab */}
          {activeTab === "colors" && (
            <>
              {/* Color System Mode Toggle */}
              {onColorSystemModeChange && (
                <section className="py-4 border-b border-current/10">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                    Color Mode
                  </h3>
                  <div className="flex gap-2">
                    <TouchButton
                      onClick={() => onColorSystemModeChange("free")}
                      className="flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          colorSystemMode === "free"
                            ? `${theme.accent}20`
                            : `${theme.text}08`,
                        color:
                          colorSystemMode === "free"
                            ? theme.accent
                            : theme.text,
                        border: `1px solid ${colorSystemMode === "free" ? theme.accent + "40" : theme.text + "15"}`,
                        minHeight: "44px",
                      }}
                    >
                      Free
                    </TouchButton>
                    <TouchButton
                      onClick={() => onColorSystemModeChange("system")}
                      className="flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          colorSystemMode === "system"
                            ? `${theme.accent}20`
                            : `${theme.text}08`,
                        color:
                          colorSystemMode === "system"
                            ? theme.accent
                            : theme.text,
                        border: `1px solid ${colorSystemMode === "system" ? theme.accent + "40" : theme.text + "15"}`,
                        minHeight: "44px",
                      }}
                    >
                      System
                    </TouchButton>
                  </div>
                </section>
              )}

              {/* System Mode: Harmony Controls */}
              {colorSystemMode === "system" && onColorBaseHueChange && (
                <section className="py-4 border-b border-current/10">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                    Harmony
                  </h3>
                  {/* Harmony type selector */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {HARMONY_OPTIONS.map((opt) => (
                      <TouchButton
                        key={opt.value}
                        onClick={() => onColorHarmonyTypeChange?.(opt.value)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wide transition-all"
                        style={{
                          backgroundColor:
                            colorHarmonyType === opt.value
                              ? `${theme.accent}25`
                              : `${theme.text}08`,
                          color:
                            colorHarmonyType === opt.value
                              ? theme.accent
                              : theme.text,
                          opacity: colorHarmonyType === opt.value ? 1 : 0.6,
                          minHeight: "32px",
                        }}
                      >
                        {opt.label}
                      </TouchButton>
                    ))}
                  </div>
                  {/* Base hue slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wide opacity-50 w-12">
                      Hue
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={colorBaseHue}
                      onChange={(e) =>
                        onColorBaseHueChange(Number(e.target.value))
                      }
                      className="flex-1"
                      style={{
                        accentColor: theme.accent,
                        minHeight: "44px",
                      }}
                    />
                    <span className="text-xs tabular-nums opacity-60 w-8 text-right">
                      {colorBaseHue}
                    </span>
                  </div>
                  {/* Live harmony preview strip */}
                  {harmonyPreview && (
                    <div
                      className="mt-3 flex rounded-lg overflow-hidden"
                      style={{ height: "28px" }}
                    >
                      {WORD_TYPE_LABELS.map(({ key }) => (
                        <div
                          key={key}
                          className="flex-1"
                          style={{
                            backgroundColor:
                              harmonyPreview[key] || theme.highlight[key],
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {/* Apply button */}
                  <TouchButton
                    onClick={handleApplyHarmony}
                    className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-current/10 hover:bg-current/20"
                    style={{ minHeight: "44px" }}
                  >
                    Apply Harmony
                  </TouchButton>
                </section>
              )}

              {/* Base Colors */}
              <section className="py-4 border-b border-current/10">
                <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                  Base Colors
                </h3>
                <div className="space-y-1">
                  <CompactColorRow
                    label="Background"
                    color={theme.background}
                    path="background"
                    bgColor={theme.background}
                    isCustomized={checkCustomized("background")}
                    onSetColor={onSetColor}
                    onResetColor={onResetColor}
                  />
                  <CompactColorRow
                    label="Text"
                    color={theme.text}
                    path="text"
                    bgColor={theme.background}
                    showContrast
                    isCustomized={checkCustomized("text")}
                    onSetColor={onSetColor}
                    onResetColor={onResetColor}
                  />
                  <CompactColorRow
                    label="Cursor"
                    color={theme.cursor}
                    path="cursor"
                    bgColor={theme.background}
                    isCustomized={checkCustomized("cursor")}
                    onSetColor={onSetColor}
                    onResetColor={onResetColor}
                  />
                </div>
              </section>

              {/* Word Type Colors — only in Free mode */}
              {colorSystemMode === "free" && (
                <section className="py-4 border-b border-current/10">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                    Word Type Colors
                  </h3>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                    {WORD_TYPE_LABELS.map(({ key, short }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: theme.highlight[key] }}
                        />
                        <span className="text-[10px] uppercase tracking-wide opacity-60 truncate flex-shrink-0 w-[28px]">
                          {short}
                        </span>
                        <input
                          type="color"
                          value={theme.highlight[key]}
                          onChange={(e) => onSetColor(key, e.target.value)}
                          className="cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
                          style={{
                            minWidth: "44px",
                            minHeight: "44px",
                            width: "44px",
                            height: "44px",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Song Colors — rhyme highlight colors */}
              {rhymeColors && onSetRhymeColor && (
                <section className="py-4 border-b border-current/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium uppercase tracking-widest opacity-50">
                      Song Colors
                    </h3>
                    <TouchButton
                      onClick={() => {
                        const hue = Math.round(Math.random() * 360);
                        const generated = generateOklchHarmony(hue, 8, theme.background);
                        generated.forEach((color, i) => onSetRhymeColor(i, color));
                      }}
                      className="text-[10px] px-2 py-1 rounded-md transition-all opacity-60 hover:opacity-100"
                      style={{
                        backgroundColor: `${theme.text}08`,
                        border: `1px solid ${theme.text}15`,
                        color: theme.text,
                      }}
                      title="Generate 8 perceptually uniform colors from a random hue (OKLCH)"
                    >
                      Auto-generate
                    </TouchButton>
                  </div>
                  {/* Preset palette strip */}
                  <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                    {RHYME_PRESETS.map((preset) => {
                      const isActive = rhymeColors.every((c, i) => c.toLowerCase() === preset.colors[i]?.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          onClick={() => {
                            preset.colors.forEach((c, i) => onSetRhymeColor!(i, c));
                          }}
                          className="flex-shrink-0 rounded-lg p-2 border transition-all text-center"
                          style={{
                            borderColor: isActive ? `${theme.accent}60` : `${theme.text}15`,
                            backgroundColor: isActive ? `${theme.accent}15` : "transparent",
                            minWidth: "56px",
                          }}
                        >
                          <div className="grid grid-cols-4 gap-0.5 mx-auto" style={{ width: "fit-content" }}>
                            {preset.colors.map((c, i) => (
                              <span
                                key={i}
                                className="rounded-full"
                                style={{ width: "8px", height: "8px", backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span
                            className="block mt-1 font-medium"
                            style={{
                              fontSize: "9px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase" as const,
                              color: isActive ? theme.accent : theme.text,
                              opacity: isActive ? 1 : 0.5,
                            }}
                          >
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {rhymeColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] uppercase tracking-wide opacity-60 truncate flex-shrink-0 w-[36px]">
                          {RHYME_COLOR_LABELS[index] || `C${index + 1}`}
                        </span>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => onSetRhymeColor(index, e.target.value)}
                          className="cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
                          style={{
                            minWidth: "44px",
                            minHeight: "44px",
                            width: "44px",
                            height: "44px",
                          }}
                        />
                        {onResetRhymeColor && (
                          <TouchButton
                            onClick={() => onResetRhymeColor(index)}
                            disabled={!isRhymeColorCustomized?.(index)}
                            className={`p-1 rounded transition-all flex-shrink-0 ${
                              isRhymeColorCustomized?.(index)
                                ? "opacity-60 hover:opacity-100"
                                : "opacity-20 cursor-not-allowed"
                            }`}
                            title={
                              isRhymeColorCustomized?.(index)
                                ? `Reset ${RHYME_COLOR_LABELS[index] || "color"}`
                                : "Using default"
                            }
                          >
                            <IconReset size={10} />
                          </TouchButton>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Save as Palette */}
              {hasColorCustomizations && onSavePalette && (
                <section className="py-4 border-b border-current/10">
                  <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                    Save as Palette
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paletteName}
                      onChange={(e) => setPaletteName(e.target.value)}
                      placeholder="Palette name..."
                      className="flex-1 px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-current/30"
                      style={{ color: theme.text, minHeight: "44px" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePalette();
                      }}
                    />
                    <TouchButton
                      onClick={handleSavePalette}
                      disabled={!paletteName.trim()}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        paletteName.trim()
                          ? "bg-current/10 hover:bg-current/20"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={{ minHeight: "44px" }}
                    >
                      Save
                    </TouchButton>
                  </div>
                  {showSaveSuccess && (
                    <div
                      className="mt-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: `${theme.text}08`,
                        borderColor: `${theme.text}15`,
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.text }}
                      >
                        Saved "{savedPaletteName}"
                      </p>
                      <p className="text-xs mt-1 opacity-60">
                        Find it in the theme selector (dashed border)
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Reset */}
              <section className="py-4">
                <TouchButton
                  onClick={onResetToPreset}
                  disabled={!hasCustomizations}
                  className={`w-full py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    hasCustomizations
                      ? "bg-current/10 hover:bg-current/20"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  <IconReset size={16} />
                  Reset All to Preset
                </TouchButton>
              </section>
            </>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <section className="py-4">
              <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                Font Family
              </h3>
              <div className="space-y-1">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => onFontChange(font.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                      currentFontId === font.id
                        ? "ring-1 ring-current bg-current/5"
                        : "hover:bg-current/5"
                    }`}
                    style={{ fontFamily: font.family, minHeight: "44px" }}
                  >
                    <span className="font-medium text-sm">{font.name}</span>
                    <span className="block text-xs opacity-50">
                      The quick brown fox jumps over the lazy dog
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Themes Tab */}
          {activeTab === "themes" && onToggleThemeVisibility && (
            <ThemesTab
              theme={theme}
              hiddenThemeIds={hiddenThemeIds}
              onToggleThemeVisibility={onToggleThemeVisibility}
              themeOrder={themeOrder}
              onReorderThemes={onReorderThemes}
            />
          )}

          {/* Display Tab */}
          {activeTab === "display" && (
            <section className="py-4">
              <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                Display Options
              </h3>
              <label
                className="flex items-start gap-3 rounded-xl p-3 border border-current/10 bg-current/5 cursor-pointer"
                data-testid="utf8-display-toggle-wrapper"
                style={{ minHeight: "44px" }}
              >
                <input
                  type="checkbox"
                  checked={utf8DisplayEnabled}
                  onChange={(e) => onToggleUtf8Display(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-current/30 bg-transparent accent-current"
                  data-testid="utf8-display-toggle"
                />
                <div>
                  <p className="text-sm font-medium">UTF Emoji Display</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    On: show `U+...` code points. Off: show native emoji glyphs.
                  </p>
                </div>
              </label>
            </section>
          )}
        </div>

        {/* Sticky footer with build info */}
        <div className="flex-shrink-0 border-t border-current/10 px-4 py-3">
          <p
            className="text-xs opacity-55 text-center"
            data-testid="settings-build-footer"
          >
            Build {BUILD_IDENTITY} · {BUILD_WORDISM}
          </p>
        </div>
      </div>
    </>
  );
};

export default ThemeCustomizer;
