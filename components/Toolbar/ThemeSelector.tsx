import React from 'react';
import { RisoTheme } from '../../types';
import { THEMES } from '../../constants';
import Tooltip from '../Tooltip';
import { SavedPalette } from '../../hooks/useCustomPalettes';

interface ThemeSelectorProps {
  currentTheme: RisoTheme;
  themeId: string;
  onThemeChange: (id: string) => void;
  hiddenThemeIds?: string[];
  customPalettes?: SavedPalette[];
  activePaletteId?: string | null;
  onPaletteSelect?: (palette: SavedPalette) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  themeId,
  onThemeChange,
  hiddenThemeIds = [],
  customPalettes = [],
  activePaletteId = null,
  onPaletteSelect,
}) => {
  // Filter out hidden themes
  const visibleThemes = THEMES.filter(t => !hiddenThemeIds.includes(t.id));

  return (
    <div className="flex gap-1.5 flex-wrap max-w-[200px] md:max-w-[280px] items-center">
      {/* Preset Themes */}
      {visibleThemes.map((t) => (
        <Tooltip key={t.id} content={t.name} position="bottom">
          <button
            onClick={() => onThemeChange(t.id)}
            className={`w-6 h-6 md:w-5 md:h-5 rounded-full transition-all duration-200 min-w-[24px] min-h-[24px] md:min-w-[20px] md:min-h-[20px] touch-manipulation ${
              themeId === t.id && !activePaletteId
                ? 'ring-2 ring-offset-2 scale-110'
                : 'hover:scale-110 opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: t.accent,
              '--tw-ring-color': currentTheme.text,
              '--tw-ring-offset-color': currentTheme.background,
            } as React.CSSProperties}
            title={t.name}
          />
        </Tooltip>
      ))}

      {/* Visual Separator if there are custom palettes */}
      {customPalettes.length > 0 && (
        <div
          className="w-px h-5 mx-1 opacity-30"
          style={{ backgroundColor: currentTheme.text }}
        />
      )}

      {/* Custom Palettes */}
      {customPalettes.map((palette) => (
        <Tooltip key={palette.id} content={palette.name} position="bottom">
          <button
            onClick={() => onPaletteSelect?.(palette)}
            className={`w-6 h-6 md:w-5 md:h-5 rounded-full transition-all duration-200 min-w-[24px] min-h-[24px] md:min-w-[20px] md:min-h-[20px] touch-manipulation border-2 border-dashed ${
              activePaletteId === palette.id
                ? 'ring-2 ring-offset-2 scale-110'
                : 'hover:scale-110 opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: palette.overrides.background ||
                (THEMES.find(t => t.id === palette.baseThemeId)?.accent || '#888'),
              borderColor: currentTheme.text,
              '--tw-ring-color': currentTheme.text,
              '--tw-ring-offset-color': currentTheme.background,
            } as React.CSSProperties}
            title={palette.name}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default ThemeSelector;
