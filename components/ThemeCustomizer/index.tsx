import React, { useState } from 'react';
import { RisoTheme } from '../../types';
import { FONT_OPTIONS, FontId, THEMES } from '../../constants';
import { meetsMinimumContrast, getContrastRatio, formatContrastRatio } from '../../utils/colorContrast';
import ColorPicker from '../ColorPicker';
import TouchButton from '../TouchButton';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RisoTheme;
  hasCustomizations: boolean;
  onSetColor: (path: string, color: string) => void;
  onResetToPreset: () => void;
  currentFontId: FontId;
  onFontChange: (fontId: FontId) => void;
  // New props for palette saving
  onSavePalette?: (name: string) => void;
  // New props for theme visibility
  hiddenThemeIds?: string[];
  onToggleThemeVisibility?: (id: string) => void;
}

const WORD_TYPE_LABELS: { key: keyof RisoTheme['highlight']; label: string }[] = [
  { key: 'noun', label: 'Nouns' },
  { key: 'verb', label: 'Verbs' },
  { key: 'adjective', label: 'Adjectives' },
  { key: 'adverb', label: 'Adverbs' },
  { key: 'pronoun', label: 'Pronouns' },
  { key: 'preposition', label: 'Prepositions' },
  { key: 'conjunction', label: 'Conjunctions' },
  { key: 'article', label: 'Articles' },
  { key: 'interjection', label: 'Interjections' },
];

// Minimum contrast ratio (2.08:1 as per plan)
const MIN_CONTRAST_RATIO = 2.08;

interface ContrastWarningProps {
  fg: string;
  bg: string;
}

const ContrastWarning: React.FC<ContrastWarningProps> = ({ fg, bg }) => {
  const ratio = getContrastRatio(fg, bg);
  const passes = ratio >= MIN_CONTRAST_RATIO;

  if (passes) return null;

  return (
    <span
      className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded"
      style={{
        backgroundColor: '#FEF3C7',
        color: '#92400E',
      }}
      title={`Contrast ratio ${formatContrastRatio(ratio)} is below minimum ${MIN_CONTRAST_RATIO}:1`}
    >
      Low contrast
    </span>
  );
};

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  theme,
  hasCustomizations,
  onSetColor,
  onResetToPreset,
  currentFontId,
  onFontChange,
  onSavePalette,
  hiddenThemeIds = [],
  onToggleThemeVisibility,
}) => {
  const [paletteName, setPaletteName] = useState('');

  if (!isOpen) return null;

  const handleSavePalette = () => {
    if (paletteName.trim() && onSavePalette) {
      onSavePalette(paletteName.trim());
      setPaletteName('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[101] overflow-y-auto"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-current/10 backdrop-blur-sm"
          style={{ backgroundColor: `${theme.background}ee` }}
        >
          <h2 className="text-lg font-bold">Customize Theme</h2>
          <TouchButton
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
            title="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </TouchButton>
        </div>

        <div className="p-4 space-y-8">
          {/* Font Selection Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-70">
              Font
            </h3>
            <div className="space-y-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => onFontChange(font.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentFontId === font.id
                      ? 'ring-2 ring-current bg-black/5'
                      : 'hover:bg-black/5'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <span className="font-medium">{font.name}</span>
                  <span className="block text-sm opacity-50 mt-0.5">
                    The quick brown fox jumps
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Base Colors Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-70">
              Base Colors
            </h3>
            <div className="space-y-4">
              <ColorPicker
                label="Background"
                color={theme.background}
                onChange={(color) => onSetColor('background', color)}
              />
              <div className="flex items-center">
                <div className="flex-1">
                  <ColorPicker
                    label="Text"
                    color={theme.text}
                    onChange={(color) => onSetColor('text', color)}
                  />
                </div>
                <ContrastWarning fg={theme.text} bg={theme.background} />
              </div>
              <ColorPicker
                label="Cursor"
                color={theme.cursor}
                onChange={(color) => onSetColor('cursor', color)}
              />
            </div>
          </section>

          {/* Word Type Colors Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-70">
              Word Type Colors
            </h3>
            <div className="space-y-4">
              {WORD_TYPE_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <div className="flex-1">
                    <ColorPicker
                      label={label}
                      color={theme.highlight[key]}
                      onChange={(color) => onSetColor(key, color)}
                    />
                  </div>
                  <ContrastWarning fg={theme.highlight[key]} bg={theme.background} />
                </div>
              ))}
            </div>
          </section>

          {/* Save as Palette Section - Only show when customizations exist */}
          {hasCustomizations && onSavePalette && (
            <section className="pt-4 border-t border-current/10">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-70">
                Save as Palette
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  placeholder="Palette name..."
                  className="flex-1 px-3 py-2 rounded-lg border border-current/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-current/30"
                  style={{ color: theme.text }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSavePalette();
                    }
                  }}
                />
                <TouchButton
                  onClick={handleSavePalette}
                  disabled={!paletteName.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    paletteName.trim()
                      ? 'bg-current/10 hover:bg-current/20'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Save
                </TouchButton>
              </div>
              <p className="text-xs opacity-50 mt-2">
                Save your current customizations as a reusable palette
              </p>
            </section>
          )}

          {/* Visible Presets Section */}
          {onToggleThemeVisibility && (
            <section className="pt-4 border-t border-current/10">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-70">
                Visible Presets
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => {
                  const isHidden = hiddenThemeIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!isHidden}
                        onChange={() => onToggleThemeVisibility(t.id)}
                        className="w-4 h-4 rounded border-2 border-current/30 bg-transparent accent-current"
                      />
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span className="text-sm truncate">{t.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs opacity-50 mt-2">
                Uncheck themes to hide them from the theme selector
              </p>
            </section>
          )}

          {/* Actions */}
          <section className="pt-4 border-t border-current/10">
            <TouchButton
              onClick={onResetToPreset}
              disabled={!hasCustomizations}
              className={`w-full py-3 px-4 rounded-lg text-center font-medium transition-all ${
                hasCustomizations
                  ? 'bg-current/10 hover:bg-current/20'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Reset to Preset Theme
            </TouchButton>
          </section>
        </div>
      </div>
    </>
  );
};

export default ThemeCustomizer;
