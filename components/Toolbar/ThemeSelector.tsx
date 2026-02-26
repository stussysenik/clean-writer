import React, {
  useRef,
  useEffect,
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

// Shared swatch circle used for preset themes
const SwatchCircle = ({
  id, name, color, isSelected, hasEdits, currentTheme, onClick,
}: {
  id: string; name: string; color: string;
  isSelected: boolean; hasEdits?: boolean;
  currentTheme: RisoTheme;
  onClick: () => void;
}) => (
  <div className="relative group flex-shrink-0">
    <Tooltip content={name} position="bottom">
      <button
        onClick={onClick}
        data-theme-id={id}
        className={`relative w-8 h-8 md:w-8 md:h-8 rounded-full transition-all duration-200 touch-manipulation ${
          isSelected ? "" : "hover:scale-110 opacity-80 hover:opacity-100"
        }`}
        style={{
          backgroundColor: color,
          transform: isSelected ? "scale(1.15)" : undefined,
          boxShadow: isSelected
            ? `0 0 0 2px ${currentTheme.background}, 0 0 0 3.5px ${currentTheme.text}`
            : undefined,
          transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-label={name}
      >
        {hasEdits && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px]"
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active theme into view on mount & when themeId changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.querySelector(`[data-theme-id="${themeId}"]`);
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [themeId]);

  return (
    <div className="overflow-hidden md:overflow-visible rounded-[20px] md:rounded-none">
      {/* Mobile: horizontal scroll strip with fade edges / Desktop: wrapped grid */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 md:gap-3 items-center overflow-x-auto md:flex-wrap md:max-w-[336px] no-scrollbar theme-scroll-fade py-[5px] px-[5px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
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
