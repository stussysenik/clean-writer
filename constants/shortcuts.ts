import type { HighlightConfig } from "../types";

export interface ShortcutDef {
  id: string;
  hotkey: string;
  label: string;
  category: "editing" | "view" | "wordtype" | "focus" | "debug";
}

/** Word type names in order (1-9 mapping) */
const WORD_TYPE_NAMES: Array<keyof HighlightConfig> = [
  "nouns",
  "verbs",
  "adjectives",
  "adverbs",
  "pronouns",
  "prepositions",
  "conjunctions",
  "articles",
  "interjections",
];

export const SHORTCUTS: ShortcutDef[] = [
  // Editing
  { id: "strikethrough", hotkey: "Mod+2", label: "Strikethrough", category: "editing" },
  { id: "clean", hotkey: "Mod+3", label: "Clean struck text", category: "editing" },
  { id: "delete-all", hotkey: "Mod+6", label: "Delete all", category: "editing" },
  { id: "export", hotkey: "Mod+5", label: "Export markdown", category: "editing" },
  // View
  { id: "preview", hotkey: "Mod+0", label: "Toggle preview", category: "view" },
  { id: "focus-cycle", hotkey: "Mod+4", label: "Cycle focus mode", category: "view" },
  { id: "plain-mode", hotkey: "Mod+1", label: "Toggle plain mode", category: "view" },
  // Word types (1-9)
  ...WORD_TYPE_NAMES.map((name, i) => ({
    id: `toggle-${name}`,
    hotkey: String(i + 1),
    label: `Toggle ${name}`,
    category: "wordtype" as const,
  })),
  // Focus navigation (capture-phase — not managed by TanStack)
  { id: "focus-left", hotkey: "ArrowLeft", label: "Navigate focus left", category: "focus" },
  { id: "focus-right", hotkey: "ArrowRight", label: "Navigate focus right", category: "focus" },
  { id: "focus-up", hotkey: "ArrowUp", label: "Change focus level up", category: "focus" },
  { id: "focus-down", hotkey: "ArrowDown", label: "Change focus level down", category: "focus" },
  { id: "focus-exit", hotkey: "Escape", label: "Exit focus mode", category: "focus" },
  // Debug (self-contained utility — not managed by TanStack)
  { id: "debug-overlap", hotkey: "Mod+Alt+Shift+O", label: "Overlap debug", category: "debug" },
  { id: "debug-overlap-alt", hotkey: "Mod+Alt+Shift+D", label: "Overlap debug (alt)", category: "debug" },
];

/** Word type key names in order, for mapping number keys 1-9 to toggleHighlight */
export const WORD_TYPE_KEYS = WORD_TYPE_NAMES;
