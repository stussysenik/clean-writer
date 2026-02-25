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

  const clearTimer = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  // Dismiss delete badges on outside tap
  useEffect(() => {
    if (!showDeleteBadges) return;
    const dismiss = () => setShowDeleteBadges(false);
    const id = setTimeout(() => window.addEventListener("pointerdown", dismiss, { once: true }), 100);
    return () => { clearTimeout(id); window.removeEventListener("pointerdown", dismiss); };
  }, [showDeleteBadges]);

  useEffect(() => clearTimer, [clearTimer]);

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

  return (
    <div className="max-w-[256px] md:max-w-[336px] max-h-[122px] overflow-hidden p-[8px]">
      <div className="flex gap-3 flex-wrap items-center">
        {visibleThemes.map((t) => (
          <SwatchCircle
            key={t.id} id={t.id} name={t.name} color={t.accent}
            isSelected={themeId === t.id && !activePaletteId}
            isPreset canDelete={canDelete}
            currentTheme={currentTheme} showBadge={showDeleteBadges}
            onClick={() => onThemeChange(t.id)}
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
              onClick={() => onPaletteSelect?.(palette)}
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
