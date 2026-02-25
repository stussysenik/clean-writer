import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { RisoTheme } from "../../types";
import { THEMES } from "../../constants";
import Tooltip from "../Tooltip";
import { SavedPalette } from "../../hooks/useCustomPalettes";
import { averageHighlightColor } from "../../utils/colorContrast";

interface ThemeSelectorProps {
  currentTheme: RisoTheme;
  themeId: string;
  onThemeChange: (id: string) => void;
  hiddenThemeIds?: string[];
  customPalettes?: SavedPalette[];
  activePaletteId?: string | null;
  onPaletteSelect?: (palette: SavedPalette) => void;
  orderedThemes?: typeof THEMES;
  onDeleteTheme?: (id: string, isPreset: boolean) => void;
}

// Long-press threshold for showing delete badge (mobile)
const LONG_PRESS_MS = 400;
// Double-tap threshold
const DOUBLE_TAP_MS = 300;
// Swipe threshold
const SWIPE_THRESHOLD_PX = 50;

// Small red X badge for deleting a theme (module-scope to avoid re-creation)
const DeleteBadge = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none z-10 hover:scale-110 transition-transform"
    style={{ backgroundColor: "#e5534b" }}
    aria-label="Remove theme"
  >
    ✕
  </button>
);

// Shared swatch circle used for both preset themes and custom palettes
const SwatchCircle = ({
  id, name, color, isSelected, isPreset, dashed,
  currentTheme, showBadge, canDelete,
  onClick, onDelete, pointerHandlers,
}: {
  id: string; name: string; color: string;
  isSelected: boolean; isPreset: boolean; dashed?: boolean;
  currentTheme: RisoTheme; showBadge: boolean; canDelete: boolean;
  onClick: () => void;
  onDelete: (id: string, isPreset: boolean, e: React.MouseEvent) => void;
  pointerHandlers: Record<string, (e: React.PointerEvent) => void>;
}) => (
  <div className="relative group" {...pointerHandlers}>
    {canDelete && (
      <div className={showBadge ? "" : "hidden group-hover:block"}>
        <DeleteBadge onClick={(e) => onDelete(id, isPreset, e)} />
      </div>
    )}
    <Tooltip content={name} position="bottom">
      <button
        onClick={onClick}
        className={`relative w-9 h-9 md:w-8 md:h-8 rounded-full transition-all duration-200 touch-manipulation ${
          dashed ? "border-2 border-dashed" : ""
        } ${isSelected ? "" : "hover:scale-110 opacity-80 hover:opacity-100"}`}
        style={{
          backgroundColor: color,
          ...(dashed && { borderColor: `${currentTheme.text}50` }),
          transform: isSelected ? "scale(1.1)" : undefined,
          boxShadow: isSelected
            ? `0 0 0 2px ${currentTheme.background}, 0 0 0 4px ${currentTheme.text}`
            : undefined,
          transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-label={name}
      />
    </Tooltip>
  </div>
);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  themeId,
  onThemeChange,
  hiddenThemeIds = [],
  customPalettes = [],
  activePaletteId = null,
  onPaletteSelect,
  orderedThemes = THEMES,
  onDeleteTheme,
}) => {
  const visibleThemes = orderedThemes.filter(
    (t) => !hiddenThemeIds.includes(t.id),
  );
  const canDelete = visibleThemes.length > 1;

  // Long-press state (mobile: toggles delete badges)
  const [showDeleteBadges, setShowDeleteBadges] = useState(false);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const movedRef = useRef(false);

  // Double-tap state
  const lastTapTimeRef = useRef<number>(0);
  const lastTapTargetRef = useRef<string | null>(null);
  const tapDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe state
  const touchStartXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const clearTapTimer = useCallback(() => {
    if (tapDelayTimerRef.current) {
      clearTimeout(tapDelayTimerRef.current);
      tapDelayTimerRef.current = null;
    }
  }, []);

  // Dismiss delete badges on outside tap
  useEffect(() => {
    if (!showDeleteBadges) return;
    const dismiss = () => setShowDeleteBadges(false);
    const id = setTimeout(() => window.addEventListener("pointerdown", dismiss, { once: true }), 100);
    return () => { clearTimeout(id); window.removeEventListener("pointerdown", dismiss); };
  }, [showDeleteBadges]);

  useEffect(() => {
    clearTimer();
    return clearTapTimer;
  }, [clearTimer, clearTapTimer]);

  // Handle theme click with double-tap detection
  const handleThemeClick = useCallback((id: string, isPreset: boolean) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    const isSameTarget = lastTapTargetRef.current === id;

    // Clear any pending single-tap action
    clearTapTimer();

    // Double-tap detected
    if (timeSinceLastTap < DOUBLE_TAP_MS && isSameTarget && canDelete && onDeleteTheme) {
      onDeleteTheme(id, isPreset);
      lastTapTimeRef.current = 0;
      lastTapTargetRef.current = null;
      return;
    }

    // Single tap - delay to allow for double-tap
    lastTapTimeRef.current = now;
    lastTapTargetRef.current = id;

    tapDelayTimerRef.current = setTimeout(() => {
      if (isPreset) {
        onThemeChange(id);
      }
    }, DOUBLE_TAP_MS);
  }, [canDelete, onDeleteTheme, onThemeChange, clearTapTimer]);

  // Handle palette click (no double-tap needed for palettes)
  const handlePaletteClick = useCallback((palette: SavedPalette) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    const isSameTarget = lastTapTargetRef.current === palette.id;

    clearTapTimer();

    // Double-tap to delete
    if (timeSinceLastTap < DOUBLE_TAP_MS && isSameTarget && onDeleteTheme) {
      onDeleteTheme(palette.id, false);
      lastTapTimeRef.current = 0;
      lastTapTargetRef.current = null;
      return;
    }

    // Single tap - select palette
    lastTapTimeRef.current = now;
    lastTapTargetRef.current = palette.id;

    tapDelayTimerRef.current = setTimeout(() => {
      onPaletteSelect?.(palette);
    }, DOUBLE_TAP_MS);
  }, [onPaletteSelect, onDeleteTheme, clearTapTimer]);

  const pointerHandlers = {
    onPointerDown: useCallback(() => {
      movedRef.current = false;
      longPressRef.current = setTimeout(() => {
        if (!movedRef.current) {
          if (navigator.vibrate) navigator.vibrate(50);
          setShowDeleteBadges(true);
        }
      }, LONG_PRESS_MS);
    }, []),
    onPointerMove: useCallback(() => { movedRef.current = true; clearTimer(); }, [clearTimer]),
    onPointerUp: clearTimer,
    onPointerCancel: clearTimer,
  };

  const handleDelete = useCallback(
    (id: string, isPreset: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteTheme?.(id, isPreset);
      setShowDeleteBadges(false);
    },
    [onDeleteTheme],
  );

  // Swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      // Find current index
      const currentIndex = visibleThemes.findIndex((t) => t.id === themeId && !activePaletteId);

      if (currentIndex !== -1) {
        if (deltaX > 0) {
          // Swipe right - previous theme
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            onThemeChange(visibleThemes[prevIndex].id);
          }
        } else {
          // Swipe left - next theme
          const nextIndex = currentIndex + 1;
          if (nextIndex < visibleThemes.length) {
            onThemeChange(visibleThemes[nextIndex].id);
          }
        }
      }
    }
  }, [visibleThemes, themeId, activePaletteId, onThemeChange]);

  return (
    <div
      ref={containerRef}
      className="max-w-[256px] md:max-w-[336px] max-h-[122px] overflow-hidden p-[8px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex gap-3 flex-wrap items-center">
        {visibleThemes.map((t) => (
          <SwatchCircle
            key={t.id} id={t.id} name={t.name} color={t.accent}
            isSelected={themeId === t.id && !activePaletteId}
            isPreset canDelete={canDelete}
            currentTheme={currentTheme} showBadge={showDeleteBadges}
            onClick={() => handleThemeClick(t.id, true)}
            onDelete={handleDelete}
            pointerHandlers={pointerHandlers}
          />
        ))}

        {customPalettes.length > 0 && (
          <div className="w-px h-7 mx-1 opacity-30" style={{ backgroundColor: currentTheme.text }} />
        )}

        {customPalettes.map((palette) => {
          const base = THEMES.find((t) => t.id === palette.baseThemeId) || THEMES[0];
          const color = averageHighlightColor({ ...base.highlight, ...palette.overrides.highlight });
          return (
            <SwatchCircle
              key={palette.id} id={palette.id} name={palette.name} color={color}
              isSelected={activePaletteId === palette.id}
              isPreset={false} canDelete dashed
              currentTheme={currentTheme} showBadge={showDeleteBadges}
              onClick={() => handlePaletteClick(palette)}
              onDelete={handleDelete}
              pointerHandlers={pointerHandlers}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
