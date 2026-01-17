import { useState, useEffect, useCallback, useMemo } from 'react';
import { THEMES } from '../constants';

const HIDDEN_THEMES_STORAGE_KEY = 'clean_writer_hidden_themes';
const HAS_CUSTOMIZED_VISIBILITY_KEY = 'clean_writer_has_customized_visibility';
const THEME_ORDER_STORAGE_KEY = 'clean_writer_theme_order';

// Default visible themes: Classic (light), Midnight (dark), Paper (pure white)
const DEFAULT_VISIBLE_THEMES = ['classic', 'midnight', 'paper'];
const ALL_THEME_IDS = THEMES.map(t => t.id);

// Calculate which themes should be hidden by default (all except the 3 defaults)
const DEFAULT_HIDDEN_THEMES = ALL_THEME_IDS.filter(id => !DEFAULT_VISIBLE_THEMES.includes(id));

export function useThemeVisibility() {
  const [hiddenThemeIds, setHiddenThemeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_THEMES_STORAGE_KEY);
      const hasCustomized = localStorage.getItem(HAS_CUSTOMIZED_VISIBILITY_KEY);

      // If user has previously customized visibility, respect their choices
      if (saved !== null && hasCustomized === 'true') {
        return JSON.parse(saved);
      }

      // First time: hide all except defaults
      return DEFAULT_HIDDEN_THEMES;
    } catch {
      return DEFAULT_HIDDEN_THEMES;
    }
  });

  // Theme order state
  const [themeOrder, setThemeOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(THEME_ORDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that all themes are present
        if (Array.isArray(parsed) && parsed.length === ALL_THEME_IDS.length) {
          return parsed;
        }
      }
      return ALL_THEME_IDS;
    } catch {
      return ALL_THEME_IDS;
    }
  });

  // Get ordered themes (sorted by user's custom order)
  const orderedThemes = useMemo(() => {
    return [...THEMES].sort((a, b) => {
      const indexA = themeOrder.indexOf(a.id);
      const indexB = themeOrder.indexOf(b.id);
      return indexA - indexB;
    });
  }, [themeOrder]);

  // Persist hidden themes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_THEMES_STORAGE_KEY, JSON.stringify(hiddenThemeIds));
      // Mark that user has customized visibility (so we don't reset to defaults)
      localStorage.setItem(HAS_CUSTOMIZED_VISIBILITY_KEY, 'true');
    } catch (e) {
      console.warn('Could not save hidden themes');
    }
  }, [hiddenThemeIds]);

  // Persist theme order to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_ORDER_STORAGE_KEY, JSON.stringify(themeOrder));
    } catch (e) {
      console.warn('Could not save theme order');
    }
  }, [themeOrder]);

  // Reorder themes
  const reorderThemes = useCallback((fromIndex: number, toIndex: number) => {
    setThemeOrder(prev => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return newOrder;
    });
  }, []);

  // Hide a theme
  const hideTheme = useCallback((id: string) => {
    setHiddenThemeIds(prev =>
      prev.includes(id) ? prev : [...prev, id]
    );
  }, []);

  // Show a theme (unhide)
  const showTheme = useCallback((id: string) => {
    setHiddenThemeIds(prev => prev.filter(hid => hid !== id));
  }, []);

  // Toggle theme visibility
  const toggleThemeVisibility = useCallback((id: string) => {
    setHiddenThemeIds(prev =>
      prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]
    );
  }, []);

  // Check if a theme is hidden
  const isThemeHidden = useCallback((id: string): boolean => {
    return hiddenThemeIds.includes(id);
  }, [hiddenThemeIds]);

  return {
    hiddenThemeIds,
    hideTheme,
    showTheme,
    toggleThemeVisibility,
    isThemeHidden,
    themeOrder,
    orderedThemes,
    reorderThemes,
  };
}

export default useThemeVisibility;
