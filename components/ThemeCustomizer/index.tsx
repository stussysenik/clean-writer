import React, { useState } from 'react';
import { RisoTheme } from '../../types';
import { FONT_OPTIONS, FontId, THEMES } from '../../constants';
import { meetsMinimumContrast, getContrastRatio, formatContrastRatio } from '../../utils/colorContrast';
import ColorPicker from '../ColorPicker';
import TouchButton from '../TouchButton';

// Reset icon component
const IconReset: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      className="px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap"
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

interface ColorRowProps {
  label: string;
  color: string;
  path: string;
  bgColor: string;
  showContrast?: boolean;
  isCustomized?: boolean;
  onSetColor: (path: string, color: string) => void;
  onResetColor?: (path: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({
  label,
  color,
  path,
  bgColor,
  showContrast = false,
  isCustomized = false,
  onSetColor,
  onResetColor,
}) => (
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <ColorPicker
        label={label}
        color={color}
        onChange={(c) => onSetColor(path, c)}
      />
    </div>
    {showContrast && <ContrastWarning fg={color} bg={bgColor} />}
    {onResetColor && (
      <TouchButton
        onClick={() => onResetColor(path)}
        disabled={!isCustomized}
        className={`p-1.5 rounded transition-all ${
          isCustomized
            ? 'opacity-60 hover:opacity-100 hover:bg-black/10'
            : 'opacity-20 cursor-not-allowed'
        }`}
        title={isCustomized ? `Reset ${label.toLowerCase()} to preset` : `${label} is using preset value`}
      >
        <IconReset size={14} />
      </TouchButton>
    )}
  </div>
);

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
}) => {
  const [paletteName, setPaletteName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [savedPaletteName, setSavedPaletteName] = useState('');

  if (!isOpen) return null;

  // Check if there are actual color customizations (not just visibility changes)
  const hasColorCustomizations = isColorCustomized
    ? ['background', 'text', 'cursor', 'selection', 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'article', 'interjection'].some(path => isColorCustomized(path as any))
    : hasCustomizations;

  const handleSavePalette = () => {
    if (paletteName.trim() && onSavePalette) {
      const name = paletteName.trim();
      onSavePalette(name);
      setSavedPaletteName(name);
      setPaletteName('');
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4000); // Longer timeout so user can read it
    }
  };

  const checkCustomized = (path: string) => isColorCustomized?.(path) ?? false;

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
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-current/10 backdrop-blur-sm z-10"
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

        <div className="p-5">
          {/* Font Selection Section */}
          <section className="pb-6 border-b border-current/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">
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
          <section className="py-6 border-b border-current/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">
              Base Colors
            </h3>
            <div className="space-y-4">
              <ColorRow
                label="Background"
                color={theme.background}
                path="background"
                bgColor={theme.background}
                isCustomized={checkCustomized('background')}
                onSetColor={onSetColor}
                onResetColor={onResetColor}
              />
              <ColorRow
                label="Text"
                color={theme.text}
                path="text"
                bgColor={theme.background}
                showContrast
                isCustomized={checkCustomized('text')}
                onSetColor={onSetColor}
                onResetColor={onResetColor}
              />
              <ColorRow
                label="Cursor"
                color={theme.cursor}
                path="cursor"
                bgColor={theme.background}
                isCustomized={checkCustomized('cursor')}
                onSetColor={onSetColor}
                onResetColor={onResetColor}
              />
            </div>
          </section>

          {/* Word Type Colors Section */}
          <section className="py-6 border-b border-current/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">
              Word Type Colors
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {WORD_TYPE_LABELS.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  color={theme.highlight[key]}
                  path={key}
                  bgColor={theme.background}
                  showContrast
                  isCustomized={checkCustomized(key)}
                  onSetColor={onSetColor}
                  onResetColor={onResetColor}
                />
              ))}
            </div>
          </section>

          {/* Save as Palette Section - Only show when color customizations exist */}
          {hasColorCustomizations && onSavePalette && (
            <section className="py-6 border-b border-current/10">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">
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
              {showSaveSuccess && (
                <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ "{savedPaletteName}" saved!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Find it in the theme selector (top-left, dashed border)
                  </p>
                </div>
              )}
              <p className="text-xs opacity-50 mt-2">
                Save your current color customizations as a reusable palette
              </p>
            </section>
          )}

          {/* Visible Presets Section */}
          {onToggleThemeVisibility && (
            <section className="py-6 border-b border-current/10">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">
                Visible Presets
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => {
                  const isHidden = hiddenThemeIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
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
              <p className="text-xs opacity-50 mt-3">
                Uncheck themes to hide them from the theme selector
              </p>
            </section>
          )}

          {/* Actions */}
          <section className="py-6">
            <TouchButton
              onClick={onResetToPreset}
              disabled={!hasCustomizations}
              className={`w-full py-3 px-4 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 ${
                hasCustomizations
                  ? 'bg-current/10 hover:bg-current/20'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <IconReset size={18} />
              Reset All to Preset Theme
            </TouchButton>
          </section>
        </div>
      </div>
    </>
  );
};

export default ThemeCustomizer;
