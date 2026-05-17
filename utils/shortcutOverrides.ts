const SHORTCUT_OVERRIDES_KEY = "clean_writer_shortcut_overrides";

export type ShortcutOverrides = Record<string, string>;

export function loadShortcutOverrides(): ShortcutOverrides {
  try {
    const raw = localStorage.getItem(SHORTCUT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveShortcutOverrides(overrides: ShortcutOverrides): void {
  localStorage.setItem(SHORTCUT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function overrideShortcut(id: string, newHotkey: string): void {
  const overrides = loadShortcutOverrides();
  if (newHotkey) {
    overrides[id] = newHotkey;
  } else {
    delete overrides[id];
  }
  saveShortcutOverrides(overrides);
}

export function getEffectiveHotkey(defaultHotkey: string, id: string): string {
  const overrides = loadShortcutOverrides();
  return overrides[id] || defaultHotkey;
}
