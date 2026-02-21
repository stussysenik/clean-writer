import React, { useState } from 'react';
import { RisoTheme } from '../../types';
import { FONT_OPTIONS, FontId, THEMES } from '../../constants';
import { meetsMinimumContrast, getContrastRatio, formatContrastRatio } from '../../utils/colorContrast';
import HexInput from '../ColorPicker/HexInput';
import TouchButton from '../TouchButton';

// Reset icon component
const IconReset: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

// Chevron icon
const IconChevron: React.FC<{ expanded: boolean; size?: number }> = ({ expanded, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 200ms ease',
    }}
  >
    <path d="M6 9l6 6 6-6" />
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
}

const WORD_TYPE_LABELS: { key: keyof RisoTheme['highlight']; label: string; short: string }[] = [
  { key: 'noun', label: 'Nouns', short: 'Noun' },
  { key: 'verb', label: 'Verbs', short: 'Verb' },
  { key: 'adjective', label: 'Adjectives', short: 'Adj' },
  { key: 'adverb', label: 'Adverbs', short: 'Adv' },
  { key: 'pronoun', label: 'Pronouns', short: 'Pron' },
  { key: 'preposition', label: 'Prepositions', short: 'Prep' },
  { key: 'conjunction', label: 'Conjunctions', short: 'Conj' },
  { key: 'article', label: 'Articles', short: 'Art' },
  { key: 'interjection', label: 'Interjections', short: 'Intj' },
];

const MIN_CONTRAST_RATIO = 2.08;

/** Compact single-row color editor: [LABEL] [color-well 32×32] [hex-input] [reset] */
const CompactColorRow: React.FC<{
  label: string;
  color: string;
  path: string;
  bgColor: string;
  showContrast?: boolean;
  isCustomized?: boolean;
  onSetColor: (path: string, color: string) => void;
  onResetColor?: (path: string) => void;
}> = ({ label, color, path, bgColor, showContrast = false, isCustomized = false, onSetColor, onResetColor }) => {
  const ratio = showContrast ? getContrastRatio(color, bgColor) : null;
  const lowContrast = ratio !== null && ratio < MIN_CONTRAST_RATIO;

  return (
    <div className="flex items-center gap-2 h-[40px]">
      <span className="text-xs uppercase tracking-wide opacity-70 w-[72px] flex-shrink-0 truncate">
        {label}
      </span>
      <input
        type="color"
        value={color}
        onChange={(e) => onSetColor(path, e.target.value)}
        className="w-8 h-8 cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
        style={{ minWidth: '32px', minHeight: '32px' }}
      />
      <HexInput value={color} onChange={(c) => onSetColor(path, c)} />
      {lowContrast && (
        <span
          className="px-1 py-0.5 text-[9px] font-medium rounded whitespace-nowrap flex-shrink-0"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
          title={`Contrast ${formatContrastRatio(ratio!)} below ${MIN_CONTRAST_RATIO}:1`}
        >
          !
        </span>
      )}
      {onResetColor && (
        <TouchButton
          onClick={() => onResetColor(path)}
          disabled={!isCustomized}
          className={`p-1 rounded transition-all flex-shrink-0 ${
            isCustomized ? 'opacity-60 hover:opacity-100' : 'opacity-20 cursor-not-allowed'
          }`}
          title={isCustomized ? `Reset ${label.toLowerCase()}` : `${label} is using preset value`}
        >
          <IconReset size={12} />
        </TouchButton>
      )}
    </div>
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
}) => {
  const [paletteName, setPaletteName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [savedPaletteName, setSavedPaletteName] = useState('');
  const [isFontExpanded, setIsFontExpanded] = useState(false);

  if (!isOpen) return null;

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
      setTimeout(() => setShowSaveSuccess(false), 4000);
    }
  };

  const checkCustomized = (path: string) => isColorCustomized?.(path) ?? false;

  const selectedFont = FONT_OPTIONS.find(f => f.id === currentFontId) || FONT_OPTIONS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-current/50 z-[100]"
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
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-current/10 backdrop-blur-sm z-10"
          style={{ backgroundColor: `${theme.background}ee` }}
        >
          <h2 className="text-lg font-bold">Customize Theme</h2>
          <TouchButton
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-current/10 transition-colors"
            title="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </TouchButton>
        </div>

        <div className="px-4 py-1">
          {/* 1. Visible Presets — first section */}
          {onToggleThemeVisibility && (
            <section className="py-4 border-b border-current/10">
              <h3 className="text-xs font-medium uppercase tracking-widest mb-3 opacity-50">
                Visible Presets
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {THEMES.map((t) => {
                  const isHidden = hiddenThemeIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-current/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!isHidden}
                        onChange={() => onToggleThemeVisibility(t.id)}
                        className="w-3.5 h-3.5 rounded border-2 border-current/30 bg-transparent accent-current"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span className="text-xs truncate">{t.name}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. Font — collapsible, shows only selected by default */}
          <section className="py-4 border-b border-current/10">
            <button
              onClick={() => setIsFontExpanded(prev => !prev)}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <h3 className="text-xs font-medium uppercase tracking-widest opacity-50">
                Font
              </h3>
              <IconChevron expanded={isFontExpanded} size={14} />
            </button>
            {/* Collapsed: show selected font only */}
            {!isFontExpanded && (
              <button
                onClick={() => setIsFontExpanded(true)}
                className="w-full text-left px-3 py-2 mt-2 rounded-lg ring-1 ring-current/20 bg-current/5"
                style={{ fontFamily: selectedFont.family }}
              >
                <span className="font-medium text-sm">{selectedFont.name}</span>
                <span className="block text-xs opacity-50">
                  The quick brown fox jumps
                </span>
              </button>
            )}
            {/* Expanded: show all fonts */}
            {isFontExpanded && (
              <div className="space-y-1 mt-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      onFontChange(font.id);
                      setIsFontExpanded(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      currentFontId === font.id
                        ? 'ring-1 ring-current bg-current/5'
                        : 'hover:bg-current/5'
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    <span className="font-medium text-sm">{font.name}</span>
                    <span className="block text-xs opacity-50">
                      The quick brown fox jumps
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 3. Base Colors — compact rows */}
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
                isCustomized={checkCustomized('background')}
                onSetColor={onSetColor}
                onResetColor={onResetColor}
              />
              <CompactColorRow
                label="Text"
                color={theme.text}
                path="text"
                bgColor={theme.background}
                showContrast
                isCustomized={checkCustomized('text')}
                onSetColor={onSetColor}
                onResetColor={onResetColor}
              />
              <CompactColorRow
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

          {/* 4. Word Type Colors — compact 3-column grid */}
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
                    className="w-7 h-7 cursor-pointer rounded border-0 p-0 bg-transparent flex-shrink-0"
                    style={{ minWidth: '28px', minHeight: '28px' }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 5. Save as Palette — only when customizations exist */}
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
                  style={{ color: theme.text }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePalette();
                  }}
                />
                <TouchButton
                  onClick={handleSavePalette}
                  disabled={!paletteName.trim()}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    paletteName.trim()
                      ? 'bg-current/10 hover:bg-current/20'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
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
                  <p className="text-sm font-medium" style={{ color: theme.text }}>
                    Saved "{savedPaletteName}"
                  </p>
                  <p className="text-xs mt-1 opacity-60">
                    Find it in the theme selector (dashed border)
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 6. Reset */}
          <section className="py-4">
            <TouchButton
              onClick={onResetToPreset}
              disabled={!hasCustomizations}
              className={`w-full py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                hasCustomizations
                  ? 'bg-current/10 hover:bg-current/20'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <IconReset size={16} />
              Reset All to Preset Theme
            </TouchButton>
          </section>
        </div>
      </div>
    </>
  );
};

export default ThemeCustomizer;
