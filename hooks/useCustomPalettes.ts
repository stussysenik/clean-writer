import { useState, useEffect, useCallback } from 'react';
import { RisoTheme } from '../types';
import { THEMES } from '../constants';

const CUSTOM_PALETTES_STORAGE_KEY = 'clean_writer_custom_palettes';

export interface SavedPalette {
  id: string;
  name: string;
  createdAt: number;
  baseThemeId: string;
  overrides: Partial<{
    background: string;
    text: string;
    cursor: string;
    selection: string;
    highlight: Partial<RisoTheme['highlight']>;
  }>;
  isArchived: boolean;
}

function generateId(): string {
  return `palette-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useCustomPalettes() {
  const [palettes, setPalettes] = useState<SavedPalette[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PALETTES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist palettes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PALETTES_STORAGE_KEY, JSON.stringify(palettes));
    } catch (e) {
      console.warn('Could not save custom palettes');
    }
  }, [palettes]);

  // Save a new palette
  const savePalette = useCallback((
    name: string,
    baseThemeId: string,
    overrides: SavedPalette['overrides']
  ): SavedPalette => {
    const newPalette: SavedPalette = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      baseThemeId,
      overrides,
      isArchived: false,
    };
    setPalettes(prev => [...prev, newPalette]);
    return newPalette;
  }, []);

  // Update an existing palette
  const updatePalette = useCallback((
    id: string,
    updates: Partial<Omit<SavedPalette, 'id' | 'createdAt'>>
  ) => {
    setPalettes(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // Archive/unarchive a palette
  const archivePalette = useCallback((id: string, archived = true) => {
    setPalettes(prev =>
      prev.map(p => (p.id === id ? { ...p, isArchived: archived } : p))
    );
  }, []);

  // Delete a palette permanently
  const deletePalette = useCallback((id: string) => {
    setPalettes(prev => prev.filter(p => p.id !== id));
  }, []);

  // Apply a palette and return the effective theme
  const applyPalette = useCallback((palette: SavedPalette): RisoTheme => {
    const baseTheme = THEMES.find(t => t.id === palette.baseThemeId) || THEMES[0];
    return {
      ...baseTheme,
      id: palette.id,
      name: palette.name,
      background: palette.overrides.background || baseTheme.background,
      text: palette.overrides.text || baseTheme.text,
      cursor: palette.overrides.cursor || baseTheme.cursor,
      selection: palette.overrides.selection || baseTheme.selection,
      highlight: {
        ...baseTheme.highlight,
        ...palette.overrides.highlight,
      },
    };
  }, []);

  // Get visible (non-archived) palettes
  const visiblePalettes = palettes.filter(p => !p.isArchived);

  // Get archived palettes
  const archivedPalettes = palettes.filter(p => p.isArchived);

  return {
    palettes,
    visiblePalettes,
    archivedPalettes,
    savePalette,
    updatePalette,
    archivePalette,
    deletePalette,
    applyPalette,
  };
}

export default useCustomPalettes;
