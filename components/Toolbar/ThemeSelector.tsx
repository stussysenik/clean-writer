import React, {
  useRef,
  useCallback,
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

// Swipe threshold
const SWIPE_THRESHOLD_PX = 50;

// Shared swatch circle used for both preset themes and custom palettes
const SwatchCircle = ({
  id, name, color, isSelected, dashed, currentTheme, onClick,
}: {
  id: string; name: string; color: string;
  isSelected: boolean; dashed?: boolean;
  currentTheme: RisoTheme;
  onClick: () => void;
}) => (
  <div className="relative group">
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
}) => {
  const visibleThemes = orderedThemes.filter(
    (t) => !hiddenThemeIds.includes(t.id),
  );

  // Swipe state
  const touchStartXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
            key={t.id}
            id={t.id}
            name={t.name}
            color={t.accent}
            isSelected={themeId === t.id && !activePaletteId}
            currentTheme={currentTheme}
            onClick={() => onThemeChange(t.id)}
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
              key={palette.id}
              id={palette.id}
              name={palette.name}
              color={color}
              isSelected={activePaletteId === palette.id}
              dashed
              currentTheme={currentTheme}
              onClick={() => onPaletteSelect?.(palette)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
