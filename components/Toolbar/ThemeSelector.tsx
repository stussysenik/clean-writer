import React from 'react';
import { RisoTheme } from '../../types';
import { THEMES } from '../../constants';

interface ThemeSelectorProps {
  currentTheme: RisoTheme;
  themeId: string;
  onThemeChange: (id: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  themeId,
  onThemeChange,
}) => {
  return (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex gap-2 flex-wrap justify-end max-w-[60vw]">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onThemeChange(t.id)}
          className={`w-6 h-6 md:w-4 md:h-4 rounded-full transition-all duration-200 min-w-[24px] min-h-[24px] md:min-w-[16px] md:min-h-[16px] touch-manipulation ${
            themeId === t.id
              ? 'ring-1 ring-offset-1'
              : 'hover:scale-110 opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: t.accent,
            ringColor: currentTheme.text,
            ringOffsetColor: currentTheme.background,
          }}
          title={t.name}
        />
      ))}
    </div>
  );
};

export default ThemeSelector;
