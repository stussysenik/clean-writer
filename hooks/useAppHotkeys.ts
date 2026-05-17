import { useHotkey, useKeyHold } from "@tanstack/react-hotkeys";
import type { HighlightConfig, ViewMode } from "../types";
import { WORD_TYPE_KEYS } from "../constants/shortcuts";
import { getEffectiveHotkey } from "../utils/shortcutOverrides";

interface UseAppHotkeysProps {
  toggleHighlight: (key: keyof HighlightConfig) => void;
  handleStrikethroughWithFocus: () => void;
  handleCleanStrikethroughs: () => void;
  handleExport: () => void;
  handleClearRequest: () => void;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  cycleFocusMode: () => void;
  toggleUnstylizedMode: () => void;
  isMobile: boolean;
}

/**
 * Centralized keyboard shortcut hook replacing 3 manual useEffect listeners.
 *
 * TanStack useHotkey auto-syncs callbacks each render (no stale closures),
 * eliminating the need for the shortcutActionsRef TDZ workaround.
 */
export function useAppHotkeys({
  toggleHighlight,
  handleStrikethroughWithFocus,
  handleCleanStrikethroughs,
  handleExport,
  handleClearRequest,
  setViewMode,
  cycleFocusMode,
  toggleUnstylizedMode,
  isMobile,
}: UseAppHotkeysProps) {
  // Number keys 1-9 for word type toggles
  useHotkey("1", () => toggleHighlight(WORD_TYPE_KEYS[0]));
  useHotkey("2", () => toggleHighlight(WORD_TYPE_KEYS[1]));
  useHotkey("3", () => toggleHighlight(WORD_TYPE_KEYS[2]));
  useHotkey("4", () => toggleHighlight(WORD_TYPE_KEYS[3]));
  useHotkey("5", () => toggleHighlight(WORD_TYPE_KEYS[4]));
  useHotkey("6", () => toggleHighlight(WORD_TYPE_KEYS[5]));
  useHotkey("7", () => toggleHighlight(WORD_TYPE_KEYS[6]));
  useHotkey("8", () => toggleHighlight(WORD_TYPE_KEYS[7]));
  useHotkey("9", () => toggleHighlight(WORD_TYPE_KEYS[8]));

  // Cmd/Ctrl+Shift shortcuts — each checks for user overrides
  useHotkey(getEffectiveHotkey("Mod+Shift+X", "strikethrough"), () => handleStrikethroughWithFocus());
  useHotkey(getEffectiveHotkey("Mod+Shift+K", "clean"), () => handleCleanStrikethroughs());
  useHotkey(getEffectiveHotkey("Mod+Shift+P", "preview"), () =>
    setViewMode((v) => (v === "write" ? "preview" : "write")),
  );
  useHotkey(getEffectiveHotkey("Mod+Shift+E", "export"), () => handleExport());
  useHotkey(getEffectiveHotkey("Mod+Shift+D", "delete-all"), () => handleClearRequest());
  useHotkey(getEffectiveHotkey("Mod+Shift+F", "focus-cycle"), () => cycleFocusMode());
  useHotkey(getEffectiveHotkey("Mod+Shift+U", "plain-mode"), () => toggleUnstylizedMode());

  // Tab hold — preventDefault stops default tab behavior, useKeyHold tracks state
  // ignoreInputs: false so Tab overlay works even when textarea is focused
  useHotkey("Tab", () => {}, {
    enabled: !isMobile,
    ignoreInputs: false,
  });
  const isTabHeld = useKeyHold("Tab");

  return { tabHeld: !isMobile && isTabHeld };
}
