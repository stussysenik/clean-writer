import { useState, useEffect, useCallback } from 'react';
import { RisoTheme, HighlightConfig, CustomTheme } from '../types';
import { THEMES } from '../constants';

const CUSTOM_THEME_STORAGE_KEY = 'clean_writer_custom_theme';

interface CustomThemeState {
  baseThemeId: string;
  overrides: Partial<{
    background: string;
    text: string;
    cursor: string;
    selection: string;
    highlight: Partial<RisoTheme['highlight']>;
  }>;
  wordVisibility: HighlightConfig;
}

const defaultVisibility: HighlightConfig = {
  nouns: true,
  pronouns: true,
  verbs: true,
  adjectives: true,
  adverbs: true,
  prepositions: true,
  conjunctions: true,
  articles: true,
  interjections: true,
};

export function useCustomTheme(baseThemeId: string) {
  const [customState, setCustomState] = useState<CustomThemeState | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Get base theme
  const baseTheme = THEMES.find(t => t.id === baseThemeId) || THEMES[0];

  // Apply overrides to create effective theme
  const effectiveTheme: RisoTheme = customState?.baseThemeId === baseThemeId && customState?.overrides
    ? {
        ...baseTheme,
        background: customState.overrides.background || baseTheme.background,
        text: customState.overrides.text || baseTheme.text,
        cursor: customState.overrides.cursor || baseTheme.cursor,
        selection: customState.overrides.selection || baseTheme.selection,
        highlight: {
          ...baseTheme.highlight,
          ...customState.overrides.highlight,
        },
      }
    : baseTheme;

  const wordVisibility = customState?.wordVisibility || defaultVisibility;

  // Persist custom theme state
  useEffect(() => {
    try {
      if (customState) {
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customState));
      } else {
        localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not save custom theme');
    }
  }, [customState]);

  // Set a specific color
  const setColor = useCallback((
    path: 'background' | 'text' | 'cursor' | 'selection' | keyof RisoTheme['highlight'],
    color: string
  ) => {
    setCustomState(prev => {
      const base = prev || { baseThemeId, overrides: {}, wordVisibility: defaultVisibility };
      const highlightKeys: (keyof RisoTheme['highlight'])[] = [
        'noun', 'pronoun', 'verb', 'adjective', 'adverb',
        'preposition', 'conjunction', 'article', 'interjection'
      ];

      if (highlightKeys.includes(path as keyof RisoTheme['highlight'])) {
        return {
          ...base,
          baseThemeId,
          overrides: {
            ...base.overrides,
            highlight: {
              ...base.overrides?.highlight,
              [path]: color,
            },
          },
        };
      }

      return {
        ...base,
        baseThemeId,
        overrides: {
          ...base.overrides,
          [path]: color,
        },
      };
    });
  }, [baseThemeId]);

  // Toggle word type visibility
  const toggleVisibility = useCallback((key: keyof HighlightConfig) => {
    setCustomState(prev => {
      const base = prev || { baseThemeId, overrides: {}, wordVisibility: defaultVisibility };
      return {
        ...base,
        wordVisibility: {
          ...base.wordVisibility,
          [key]: !base.wordVisibility[key],
        },
      };
    });
  }, [baseThemeId]);

  // Reset to preset theme
  const resetToPreset = useCallback(() => {
    setCustomState(null);
  }, []);

  // Check if theme has customizations
  const hasCustomizations = customState !== null && customState.baseThemeId === baseThemeId;

  return {
    effectiveTheme,
    wordVisibility,
    hasCustomizations,
    setColor,
    toggleVisibility,
    resetToPreset,
  };
}

export default useCustomTheme;
