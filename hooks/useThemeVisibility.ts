import { useState, useEffect, useCallback } from 'react';

const HIDDEN_THEMES_STORAGE_KEY = 'clean_writer_hidden_themes';

export function useThemeVisibility() {
  const [hiddenThemeIds, setHiddenThemeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_THEMES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist hidden themes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_THEMES_STORAGE_KEY, JSON.stringify(hiddenThemeIds));
    } catch (e) {
      console.warn('Could not save hidden themes');
    }
  }, [hiddenThemeIds]);

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
  };
}

export default useThemeVisibility;
