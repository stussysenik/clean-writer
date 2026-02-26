import React, {
  useRef,
  useCallback,
} from "react";
import { RisoTheme } from "../../types";
import { THEMES } from "../../constants";
import Tooltip from "../Tooltip";

interface ThemeSelectorProps {
  currentTheme: RisoTheme;
  themeId: string;
  onThemeChange: (id: string) => void;
  hiddenThemeIds?: string[];
  orderedThemes?: typeof THEMES;
  hasOverridesForTheme?: (id: string) => boolean;
}

// Swipe threshold
const SWIPE_THRESHOLD_PX = 50;

// Shared swatch circle used for preset themes
const SwatchCircle = ({
  id, name, color, isSelected, hasEdits, currentTheme, onClick,
}: {
  id: string; name: string; color: string;
  isSelected: boolean; hasEdits?: boolean;
  currentTheme: RisoTheme;
  onClick: () => void;
}) => (
  <div className="relative group">
    <Tooltip content={name} position="bottom">
      <button
        onClick={onClick}
        className={`relative w-9 h-9 md:w-8 md:h-8 rounded-full transition-all duration-200 touch-manipulation ${
          isSelected ? "" : "hover:scale-110 opacity-80 hover:opacity-100"
        }`}
        style={{
          backgroundColor: color,
          transform: isSelected ? "scale(1.1)" : undefined,
          boxShadow: isSelected
            ? `0 0 0 2px ${currentTheme.background}, 0 0 0 4px ${currentTheme.text}`
            : undefined,
          transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-label={name}
      >
        {hasEdits && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{
              backgroundColor: currentTheme.text,
              borderColor: currentTheme.background,
            }}
          />
        )}
      </button>
    </Tooltip>
  </div>
);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  themeId,
  onThemeChange,
  hiddenThemeIds = [],
  orderedThemes = THEMES,
  hasOverridesForTheme,
}) => {
  const MAX_VISIBLE = 10;
  const visibleThemes = orderedThemes
    .filter((t) => !hiddenThemeIds.includes(t.id))
    .slice(0, MAX_VISIBLE);

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
      const currentIndex = visibleThemes.findIndex((t) => t.id === themeId);

      if (currentIndex !== -1) {
        if (deltaX > 0) {
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            onThemeChange(visibleThemes[prevIndex].id);
          }
        } else {
          const nextIndex = currentIndex + 1;
          if (nextIndex < visibleThemes.length) {
            onThemeChange(visibleThemes[nextIndex].id);
          }
        }
      }
    }
  }, [visibleThemes, themeId, onThemeChange]);

  return (
    <div
      ref={containerRef}
      className="max-w-[256px] md:max-w-[336px] p-[8px]"
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
            isSelected={themeId === t.id}
            hasEdits={hasOverridesForTheme?.(t.id)}
            currentTheme={currentTheme}
            onClick={() => onThemeChange(t.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
