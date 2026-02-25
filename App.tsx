import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  THEMES,
  THEME_STORAGE_KEY,
  FONT_OPTIONS,
  FONT_STORAGE_KEY,
  BUILD_NUMBER,
  BUILD_HASH,
  RHYME_COLORS,
  FontId,
} from "./constants";
import { countWords } from "./services/localSyntaxService";
import {
  SyntaxAnalysis,
  SyntaxSets,
  ViewMode,
  HighlightConfig,
  toSyntaxSets,
  SongAnalysis,
  ColorSystemMode,
  ColorHarmonyType,
} from "./types";
import { useSyntaxWorker } from "./hooks/useSyntaxWorker";
import Typewriter from "./components/Typewriter";
import MarkdownPreview from "./components/MarkdownPreview";
import ConfirmDialog from "./components/ConfirmDialog";
import Toolbar from "./components/Toolbar";
import ThemeSelector from "./components/Toolbar/ThemeSelector";
import ThemeCustomizer from "./components/ThemeCustomizer";
import UnifiedSyntaxPanel from "./components/UnifiedSyntaxPanel";
import Toast from "./components/Toast";
import TouchButton from "./components/TouchButton";
import Tooltip from "./components/Tooltip";
import { IconSettings } from "./components/Toolbar/Icons";
import useCustomTheme from "./hooks/useCustomTheme";
import useCustomPalettes, { SavedPalette } from "./hooks/useCustomPalettes";
import useThemeVisibility from "./hooks/useThemeVisibility";
import useSelectionPersistence from "./hooks/useSelectionPersistence";
import { getIconColor } from "./utils/contrastAwareColor";
import {
  applyStrikethrough,
  hasStrikethroughBlocks,
  removeStrikethroughBlocks,
} from "./utils/strikethroughUtils";
import { initOverlapDebug } from "./utils/overlapDebug";
import useResponsiveBreakpoint from "./hooks/useResponsiveBreakpoint";

// Keyboard shortcut mapping (1-9 for word types)
const NUMBER_KEY_MAP: { [key: string]: keyof HighlightConfig } = {
  "1": "nouns",
  "2": "verbs",
  "3": "adjectives",
  "4": "adverbs",
  "5": "pronouns",
  "6": "prepositions",
  "7": "conjunctions",
  "8": "articles",
  "9": "interjections",
};

const UTF8_DISPLAY_STORAGE_KEY = "clean_writer_utf8_display_enabled";

const FRESH_LOAD_TEXT = `"It is the time you have wasted for your rose that makes your rose so important."

"People have forgotten this truth," the fox said. "But you must not forget it. You become responsible forever for what you have tamed. You are responsible for your rose."

"What is essential is invisible to the eye," the little prince repeated, so that he would be sure to remember. "It is the time you have wasted for your rose that makes your rose so important."

The little prince went away, to look again at the roses. "You are not at all like my rose," he said. "As yet you are nothing. No one has tamed you, and you have tamed no one. You are like my fox when I first knew him. He was only a fox like a hundred thousand other foxes. But I have made him my friend, and now he is unique in all the world."

— Antoine de Saint-Exupéry, The Little Prince`;

const App: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("riso_flow_content");
      if (saved !== null) return saved;
      return FRESH_LOAD_TEXT;
    } catch (e) {
      console.warn("Could not access local storage");
      return "";
    }
  });

  const [maxWidth, setMaxWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("riso_flow_max_width");
      return saved ? parseInt(saved, 10) : 800;
    } catch {
      return 800;
    }
  });

  const [themeId, setThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved && THEMES.some((t) => t.id === saved) ? saved : "classic";
    } catch {
      return "classic";
    }
  });

  const [fontId, setFontId] = useState<FontId>(() => {
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY) as FontId | null;
      return saved && FONT_OPTIONS.some((f) => f.id === saved)
        ? saved
        : "courier-prime";
    } catch {
      return "courier-prime";
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(
        "clean_writer_view_mode",
      ) as ViewMode | null;
      return saved === "write" || saved === "preview" ? saved : "write";
    } catch {
      return "write";
    }
  });
  const [syntaxData, setSyntaxData] = useState<SyntaxAnalysis>({
    nouns: [],
    pronouns: [],
    verbs: [],
    adjectives: [],
    adverbs: [],
    prepositions: [],
    conjunctions: [],
    articles: [],
    interjections: [],
    urls: [],
    numbers: [],
    hashtags: [],
  });
  const defaultHighlightConfig: HighlightConfig = {
    nouns: true,
    pronouns: true,
    verbs: true,
    adjectives: true,
    adverbs: true,
    prepositions: true,
    conjunctions: true,
    articles: true,
    interjections: true,
    urls: true,
    numbers: true,
    hashtags: true,
  };

  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>(
    () => {
      try {
        const saved = localStorage.getItem("clean_writer_highlight_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Validate the shape of the parsed object
          if (typeof parsed === "object" && "nouns" in parsed) {
            return {
              ...defaultHighlightConfig,
              ...parsed,
            };
          }
        }
        return defaultHighlightConfig;
      } catch {
        return defaultHighlightConfig;
      }
    },
  );

  const fluidFontSize = "clamp(18px, 10px + 1.1vw, 24px)";
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [utf8DisplayEnabled, setUtf8DisplayEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(UTF8_DISPLAY_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Song Mode state
  const [songMode, setSongMode] = useState(false);
  const [songData, setSongData] = useState<SongAnalysis | null>(null);
  const [showSyllableAnnotations, setShowSyllableAnnotations] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_syllable_annotations");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  // Rhyme group interaction state (mirrors word type interaction model)
  const [focusedRhymeKey, setFocusedRhymeKey] = useState<string | null>(null);
  const [hoveredRhymeKey, setHoveredRhymeKey] = useState<string | null>(null);
  const [disabledRhymeKeys, setDisabledRhymeKeys] = useState<Set<string>>(new Set());

  // Rhyme highlight shape & bold settings
  const [rhymeHighlightRadius, setRhymeHighlightRadius] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_rhyme_highlight_radius");
      return saved !== null ? Number(saved) : 4;
    } catch {
      return 4;
    }
  });
  const [rhymeBoldEnabled, setRhymeBoldEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_rhyme_bold_enabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  // Color system state
  const [colorSystemMode, setColorSystemMode] =
    useState<ColorSystemMode>("free");
  const [colorHarmonyType, setColorHarmonyType] =
    useState<ColorHarmonyType>("analogous");
  const [colorBaseHue, setColorBaseHue] = useState(220);

  // Solo mode state
  const [soloMode, setSoloMode] = useState<keyof HighlightConfig | null>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_solo_mode");
      if (saved && saved !== "null") {
        const validKeys: (keyof HighlightConfig)[] = [
          "nouns",
          "pronouns",
          "verbs",
          "adjectives",
          "adverbs",
          "prepositions",
          "conjunctions",
          "articles",
          "interjections",
          "urls",
          "numbers",
          "hashtags",
        ];
        return validKeys.includes(saved as keyof HighlightConfig)
          ? (saved as keyof HighlightConfig)
          : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Active custom palette state
  const [activePaletteId, setActivePaletteId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_active_palette");
      return saved && saved !== "null" ? saved : null;
    } catch {
      return null;
    }
  });

  // First-visit tracking for syntax panel (mobile hint animation)
  const [hasSeenSyntaxPanel, setHasSeenSyntaxPanel] = useState<boolean>(() => {
    try {
      return localStorage.getItem("seen_syntax_panel") === "true";
    } catch {
      return false;
    }
  });

  // Hovered category state for word glow effect
  const [hoveredCategory, setHoveredCategory] = useState<
    keyof HighlightConfig | null
  >(null);

  // Use custom theme hook
  const {
    effectiveTheme,
    hasCustomizations,
    setColor,
    resetToPreset,
    resetColor,
    isColorCustomized,
    rhymeColorOverrides,
    setRhymeColor,
    resetRhymeColor,
    isRhymeColorCustomized,
  } = useCustomTheme(themeId);

  // Compute effective rhyme colors (defaults overridden by user customizations)
  const effectiveRhymeColors = useMemo(
    () => RHYME_COLORS.map((def, i) => rhymeColorOverrides?.[i] ?? def),
    [rhymeColorOverrides],
  );

  // Use custom palettes hook
  const { visiblePalettes, savePalette, deletePalette, applyPalette } =
    useCustomPalettes();

  // Use theme visibility hook
  const {
    hiddenThemeIds,
    hideTheme,
    toggleThemeVisibility,
    orderedThemes,
    reorderThemes,
    themeOrder,
  } = useThemeVisibility();

  // Textarea ref for selection persistence
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Web Worker for background NLP processing
  const { analyze: analyzeInWorker, analyzeSong: analyzeSongInWorker } =
    useSyntaxWorker();

  // Selection persistence for mobile strikethrough
  const { saveSelection, getSavedSelection, savedSelection, clearSelection } =
    useSelectionPersistence(textareaRef);

  // Toast state for last-theme warning
  const [showLastThemeToast, setShowLastThemeToast] = useState(false);
  // Toast state for export success
  const [showExportToast, setShowExportToast] = useState(false);

  // Simple theme delete handler (X button on each circle)
  const handleDeleteTheme = useCallback(
    (id: string, isPreset: boolean) => {
      if (isPreset) {
        hideTheme(id);
      } else {
        deletePalette(id);
      }
    },
    [hideTheme, deletePalette],
  );

  // Get current theme - either from custom palette or from theme customizer
  const currentTheme = useMemo(() => {
    if (activePaletteId) {
      const palette = visiblePalettes.find((p) => p.id === activePaletteId);
      if (palette) {
        return applyPalette(palette);
      }
    }
    return effectiveTheme;
  }, [activePaletteId, visiblePalettes, applyPalette, effectiveTheme]);

  const currentFont =
    FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0];
  const displayFontFamily = useMemo(
    () =>
      `${currentFont.family}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Malgun Gothic", sans-serif`,
    [currentFont.family],
  );
  const wordCount = countWords(content);

  // Compute effective highlight config when solo mode is active
  const effectiveHighlightConfig = useMemo((): HighlightConfig => {
    if (!soloMode) return highlightConfig;

    // When solo mode is active, only the soloed category is enabled
    return {
      nouns: soloMode === "nouns",
      pronouns: soloMode === "pronouns",
      verbs: soloMode === "verbs",
      adjectives: soloMode === "adjectives",
      adverbs: soloMode === "adverbs",
      prepositions: soloMode === "prepositions",
      conjunctions: soloMode === "conjunctions",
      articles: soloMode === "articles",
      interjections: soloMode === "interjections",
      urls: soloMode === "urls",
      numbers: soloMode === "numbers",
      hashtags: soloMode === "hashtags",
    };
  }, [soloMode, highlightConfig]);

  // Convert syntaxData arrays to Sets for O(1) lookup performance
  const syntaxSets = useMemo(() => toSyntaxSets(syntaxData), [syntaxData]);

  // Toggle highlight handler
  const toggleHighlight = useCallback(
    (key: keyof HighlightConfig) => {
      // If in solo mode and clicking the soloed item, exit solo mode
      if (soloMode === key) {
        setSoloMode(null);
        return;
      }
      // If in solo mode and clicking a different item, just switch solo
      if (soloMode) {
        setSoloMode(key);
        return;
      }
      // Normal toggle behavior
      setHighlightConfig((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [soloMode],
  );

  // Handle solo toggle
  const handleSoloToggle = useCallback((key: keyof HighlightConfig | null) => {
    setSoloMode(key);
  }, []);

  // Handle palette selection
  const handlePaletteSelect = useCallback((palette: SavedPalette) => {
    setActivePaletteId(palette.id);
    setThemeId(palette.baseThemeId);
  }, []);

  // Handle syntax panel first open (marks as seen)
  const handleSyntaxPanelSeen = useCallback(() => {
    if (!hasSeenSyntaxPanel) {
      setHasSeenSyntaxPanel(true);
      try {
        localStorage.setItem("seen_syntax_panel", "true");
      } catch (e) {
        console.warn("Could not save syntax panel seen state");
      }
    }
  }, [hasSeenSyntaxPanel]);

  // Handle theme change (clears active palette)
  const handleThemeChange = useCallback((id: string) => {
    setThemeId(id);
    setActivePaletteId(null);
  }, []);

  // Handle saving a palette
  const handleSavePalette = useCallback(
    (name: string) => {
      // Get the current overrides from useCustomTheme
      const baseTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
      const overrides: SavedPalette["overrides"] = {};

      if (effectiveTheme.background !== baseTheme.background) {
        overrides.background = effectiveTheme.background;
      }
      if (effectiveTheme.text !== baseTheme.text) {
        overrides.text = effectiveTheme.text;
      }
      if (effectiveTheme.cursor !== baseTheme.cursor) {
        overrides.cursor = effectiveTheme.cursor;
      }
      if (effectiveTheme.selection !== baseTheme.selection) {
        overrides.selection = effectiveTheme.selection;
      }

      // Check highlight overrides
      const highlightOverrides: Partial<typeof baseTheme.highlight> = {};
      (
        Object.keys(baseTheme.highlight) as (keyof typeof baseTheme.highlight)[]
      ).forEach((key) => {
        if (effectiveTheme.highlight[key] !== baseTheme.highlight[key]) {
          highlightOverrides[key] = effectiveTheme.highlight[key];
        }
      });
      if (Object.keys(highlightOverrides).length > 0) {
        overrides.highlight = highlightOverrides;
      }

      savePalette(name, themeId, overrides);
    },
    [themeId, effectiveTheme, savePalette],
  );

  // Keyboard shortcuts for word type toggles (1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea or if modifier keys are pressed
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      const key = e.key;
      if (key in NUMBER_KEY_MAP) {
        e.preventDefault();
        toggleHighlight(NUMBER_KEY_MAP[key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleHighlight]);

  // Stable ref for action shortcuts (avoids re-registering listener on content changes)
  // NOTE: initialized empty — assigned after the callbacks are declared below (TDZ safety)
  const shortcutActionsRef = useRef<{ handleStrikethrough: () => void; handleCleanStrikethroughs: () => void; handleExport: () => void }>(null!);

  // Global keyboard shortcuts: Cmd/Ctrl + Shift + letter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
      const a = shortcutActionsRef.current;
      switch (e.key.toLowerCase()) {
        case "x": e.preventDefault(); a.handleStrikethrough(); break;
        case "k": e.preventDefault(); a.handleCleanStrikethroughs(); break;
        case "p": e.preventDefault(); setViewMode(v => v === "write" ? "preview" : "write"); break;
        case "e": e.preventDefault(); a.handleExport(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Responsive breakpoint for desktop panel padding & shortcut overlay
  const { isDesktop, isMobile } = useResponsiveBreakpoint();

  // Hold-Tab cheat sheet state
  const [tabHeld, setTabHeld] = useState(false);
  useEffect(() => {
    if (isMobile) { setTabHeld(false); return; }
    const down = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.repeat) {
        e.preventDefault();
        setTabHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Tab") setTabHeld(false);
    };
    const blur = () => setTabHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [isMobile]);

  const isMac = useMemo(
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    [],
  );

  // Font size now uses CSS clamp() — no JS resize handler needed

  // Sync selection color CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--selection-color",
      currentTheme.selection,
    );
  }, [currentTheme]);

  // Sync theme-color meta tag for PWA
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", currentTheme.background);
    }
  }, [currentTheme]);

  // Persist content to local storage
  useEffect(() => {
    try {
      localStorage.setItem("riso_flow_content", content);
    } catch (e) {
      console.warn("Could not save to local storage");
    }
  }, [content]);

  // Persist maxWidth
  useEffect(() => {
    try {
      localStorage.setItem("riso_flow_max_width", maxWidth.toString());
    } catch (e) {
      console.warn("Could not save max width");
    }
  }, [maxWidth]);

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn("Could not save theme");
    }
  }, [themeId]);

  // Persist font
  useEffect(() => {
    try {
      localStorage.setItem(FONT_STORAGE_KEY, fontId);
    } catch (e) {
      console.warn("Could not save font");
    }
  }, [fontId]);

  // Persist highlightConfig
  useEffect(() => {
    try {
      localStorage.setItem(
        "clean_writer_highlight_config",
        JSON.stringify(highlightConfig),
      );
    } catch (e) {
      console.warn("Could not save highlight config");
    }
  }, [highlightConfig]);

  // Persist viewMode
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_view_mode", viewMode);
    } catch (e) {
      console.warn("Could not save view mode");
    }
  }, [viewMode]);

  // Persist soloMode
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_solo_mode", soloMode || "null");
    } catch (e) {
      console.warn("Could not save solo mode");
    }
  }, [soloMode]);

  // Persist activePaletteId
  useEffect(() => {
    try {
      localStorage.setItem(
        "clean_writer_active_palette",
        activePaletteId || "null",
      );
    } catch (e) {
      console.warn("Could not save active palette");
    }
  }, [activePaletteId]);

  // Persist UTF-8 display preference
  useEffect(() => {
    try {
      localStorage.setItem(
        UTF8_DISPLAY_STORAGE_KEY,
        String(utf8DisplayEnabled),
      );
    } catch (e) {
      console.warn("Could not save UTF-8 display setting");
    }
  }, [utf8DisplayEnabled]);

  // Persist syllable annotations preference
  useEffect(() => {
    try {
      localStorage.setItem(
        "clean_writer_syllable_annotations",
        String(showSyllableAnnotations),
      );
    } catch (e) {
      console.warn("Could not save syllable annotations setting");
    }
  }, [showSyllableAnnotations]);

  // Persist rhyme highlight radius
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_rhyme_highlight_radius", String(rhymeHighlightRadius));
    } catch (e) {
      console.warn("Could not save rhyme highlight radius");
    }
  }, [rhymeHighlightRadius]);

  // Persist rhyme bold enabled
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_rhyme_bold_enabled", String(rhymeBoldEnabled));
    } catch (e) {
      console.warn("Could not save rhyme bold setting");
    }
  }, [rhymeBoldEnabled]);

  // Overlap debug utility (zero cost when inactive — just a keydown listener)
  useEffect(() => {
    initOverlapDebug();
  }, []);

  // Syntax analysis (runs in Web Worker for better performance)
  // Replaces data entirely on each analysis - no accumulation of stale words
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (content.length > 0) {
        try {
          const result = await analyzeInWorker(content);
          setSyntaxData(result);
        } catch (error) {
          console.warn("Syntax analysis failed:", error);
        }
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [content, analyzeInWorker]);

  // Song analysis (runs in Web Worker when song mode is active)
  useEffect(() => {
    if (!songMode || content.length === 0) {
      setSongData(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const result = await analyzeSongInWorker(content);
        setSongData(result);
      } catch (error) {
        console.warn("Song analysis failed:", error);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [content, songMode, analyzeSongInWorker]);

  // Reset rhyme interaction state when song data changes (new analysis = new groups)
  useEffect(() => {
    setFocusedRhymeKey(null);
    setDisabledRhymeKeys(new Set());
  }, [songData]);

  const handleToggleRhymeKey = useCallback((key: string) => {
    setDisabledRhymeKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clean-writer.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportToast(true);
  };

  const handleClearRequest = () => {
    setIsClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    setContent("");
    setSyntaxData({
      nouns: [],
      pronouns: [],
      verbs: [],
      adjectives: [],
      adverbs: [],
      prepositions: [],
      conjunctions: [],
      articles: [],
      interjections: [],
      urls: [],
      numbers: [],
      hashtags: [],
    });
    setIsClearDialogOpen(false);
  };

  const handleSampleTextRequest = () => {
    setIsSampleDialogOpen(true);
  };

  const handleConfirmSampleText = () => {
    setContent(FRESH_LOAD_TEXT);
    setIsSampleDialogOpen(false);
  };

  const handleStrikethrough = useCallback(() => {
    // Try to get selection from ref first, then fallback to DOM query
    const textarea = textareaRef.current || document.querySelector("textarea");
    if (!textarea) return;

    // Try saved selection first (for mobile), then live selection
    const savedSel = getSavedSelection();
    const start = savedSel ? savedSel.start : textarea.selectionStart;
    const end = savedSel ? savedSel.end : textarea.selectionEnd;

    // Clear saved selection after use
    if (savedSel) {
      clearSelection();
    }

    // No selection = nothing to strike
    if (start === end) return;

    // Apply strikethrough with merge logic
    const newContent = applyStrikethrough(content, start, end);
    setContent(newContent);

    // Refocus the textarea
    setTimeout(() => textarea.focus(), 10);
  }, [content, getSavedSelection, clearSelection]);

  const toggleViewMode = () => {
    setViewMode(viewMode === "write" ? "preview" : "write");
  };

  // Save selection on pointer/touch down (for mobile strikethrough)
  const handleStrikethroughPointerDown = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  // Magic clean: remove full `~~...~~` segments
  const hasStrikethroughs = useMemo(
    () => hasStrikethroughBlocks(content),
    [content],
  );
  const handleCleanStrikethroughs = useCallback(() => {
    const cleaned = removeStrikethroughBlocks(content);
    if (cleaned !== content) {
      setContent(cleaned);
    }
  }, [content]);

  // Assign action refs now that all callbacks are declared (see useRef above)
  shortcutActionsRef.current = { handleStrikethrough, handleCleanStrikethroughs, handleExport };

  return (
    <div
      className="w-full h-[100dvh] flex flex-col relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        fontFamily: displayFontFamily,
      }}
    >
      {/* Background Texture */}
      <div
        data-overlap-ignore
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top fade — navbar visual zone */}
      <div
        data-overlap-ignore
        className="absolute top-0 left-0 right-0 h-[144px] pointer-events-none z-[59]"
        style={{
          background: `linear-gradient(to bottom, ${currentTheme.background} 0%, ${currentTheme.background}00 100%)`,
        }}
      />


      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearDialogOpen(false)}
        theme={currentTheme}
      />

      <ConfirmDialog
        isOpen={isSampleDialogOpen}
        onConfirm={handleConfirmSampleText}
        onCancel={() => setIsSampleDialogOpen(false)}
        theme={currentTheme}
        title="Load Sample Text?"
        message={
          <>
            This will replace your current content with a sample excerpt. <br />
            <span className="opacity-50 text-xs uppercase tracking-wider">
              Your existing text will be lost.
            </span>
          </>
        }
        confirmLabel="LOAD SAMPLE"
      />

      <ThemeCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        theme={currentTheme}
        hasCustomizations={hasCustomizations}
        onSetColor={setColor}
        onResetToPreset={resetToPreset}
        onResetColor={resetColor}
        isColorCustomized={isColorCustomized}
        currentFontId={fontId}
        onFontChange={setFontId}
        onSavePalette={handleSavePalette}
        hiddenThemeIds={hiddenThemeIds}
        onToggleThemeVisibility={toggleThemeVisibility}
        utf8DisplayEnabled={utf8DisplayEnabled}
        onToggleUtf8Display={setUtf8DisplayEnabled}
        colorSystemMode={colorSystemMode}
        onColorSystemModeChange={setColorSystemMode}
        colorHarmonyType={colorHarmonyType}
        onColorHarmonyTypeChange={setColorHarmonyType}
        colorBaseHue={colorBaseHue}
        onColorBaseHueChange={setColorBaseHue}
        themeOrder={themeOrder}
        onReorderThemes={reorderThemes}
        rhymeColors={effectiveRhymeColors}
        onSetRhymeColor={setRhymeColor}
        onResetRhymeColor={resetRhymeColor}
        isRhymeColorCustomized={isRhymeColorCustomized}
        rhymeHighlightRadius={rhymeHighlightRadius}
        onRhymeHighlightRadiusChange={setRhymeHighlightRadius}
        rhymeBoldEnabled={rhymeBoldEnabled}
        onRhymeBoldEnabledChange={setRhymeBoldEnabled}
      />

      {/* Toast for warnings */}
      <Toast
        message="You need at least one theme"
        isVisible={showLastThemeToast}
        onDismiss={() => setShowLastThemeToast(false)}
        type="warning"
      />

      {/* Toast for export success */}
      <Toast
        message="Exported clean-writer.md"
        isVisible={showExportToast}
        onDismiss={() => setShowExportToast(false)}
        type="success"
      />

      {/* Top Bar with Theme Selector and Settings */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-[13px] md:p-[21px] z-[60] pointer-events-none">
        <div className="pointer-events-auto flex items-center min-h-[44px]">
          <ThemeSelector
            currentTheme={currentTheme}
            themeId={themeId}
            onThemeChange={handleThemeChange}
            hiddenThemeIds={hiddenThemeIds}
            customPalettes={visiblePalettes}
            activePaletteId={activePaletteId}
            onPaletteSelect={handlePaletteSelect}
            orderedThemes={orderedThemes}
            onDeleteTheme={handleDeleteTheme}
          />
        </div>
        {/* Hidden when customizer open — customizer has its own close (X) button */}
        {!isCustomizerOpen && (
          <div className="pointer-events-auto flex items-center min-h-[44px]">
            <Tooltip content={`Build ${BUILD_NUMBER} · ${BUILD_HASH}`} position="bottom">
              <TouchButton
                onClick={() => setIsCustomizerOpen(true)}
                className="p-2.5 rounded-xl hover:bg-current/5 transition-all duration-200"
                style={{
                  color: getIconColor(currentTheme),
                }}
              >
                <span className="block lg:scale-[1.17] lg:origin-center">
                  <IconSettings />
                </span>
              </TouchButton>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Main Area */}
      <main
        className="flex-1 w-full h-full relative z-10 pt-[89px] md:pt-[89px] lg:pt-[89px] transition-all duration-300 ease-in-out"
        style={{
          paddingRight: isDesktop && content.length > 0 ? 360 : undefined,
        }}
      >
        {viewMode === "write" ? (
          <Typewriter
            content={content}
            setContent={setContent}
            theme={currentTheme}
            syntaxSets={syntaxSets}
            highlightConfig={effectiveHighlightConfig}
            fontSize={fluidFontSize}
            maxWidth={maxWidth}
            fontFamily={displayFontFamily}
            showUtfEmojiCodes={utf8DisplayEnabled}
            textareaRef={textareaRef}
            hoveredCategory={hoveredCategory}
            persistedSelection={savedSelection}
            songMode={songMode}
            songData={songData}
            rhymeColors={effectiveRhymeColors}
            showSyllableAnnotations={songMode && showSyllableAnnotations}
            rhymeHighlightRadius={rhymeHighlightRadius}
            rhymeBoldEnabled={rhymeBoldEnabled}
            focusedRhymeKey={focusedRhymeKey}
            hoveredRhymeKey={hoveredRhymeKey}
            disabledRhymeKeys={disabledRhymeKeys}
          />
        ) : (
          <div
            className="mx-auto h-full relative z-10 transition-[max-width] duration-300 ease-in-out px-4 py-8 md:px-0 md:py-0"
            style={{ maxWidth: maxWidth }}
          >
            <MarkdownPreview content={content} theme={currentTheme} onBackToEdit={toggleViewMode} />
          </div>
        )}
      </main>

      {/* Unified Syntax Panel */}
      <UnifiedSyntaxPanel
        content={content}
        theme={currentTheme}
        syntaxData={syntaxData}
        syntaxSets={syntaxSets}
        highlightConfig={effectiveHighlightConfig}
        onToggleHighlight={toggleHighlight}
        soloMode={soloMode}
        onSoloToggle={handleSoloToggle}
        hasSeenPanel={hasSeenSyntaxPanel}
        onPanelSeen={handleSyntaxPanelSeen}
        onCategoryHover={setHoveredCategory}
        songMode={songMode}
        onToggleSongMode={() => setSongMode((prev) => !prev)}
        songData={songData}
        rhymeColors={effectiveRhymeColors}
        showSyllableAnnotations={showSyllableAnnotations}
        onToggleSyllableAnnotations={() => setShowSyllableAnnotations((prev) => !prev)}
        focusedRhymeKey={focusedRhymeKey}
        onFocusRhymeKey={setFocusedRhymeKey}
        hoveredRhymeKey={hoveredRhymeKey}
        onHoverRhymeKey={setHoveredRhymeKey}
        disabledRhymeKeys={disabledRhymeKeys}
        onToggleRhymeKey={handleToggleRhymeKey}
      />

      {/* Bottom Toolbar */}
      <Toolbar
        theme={currentTheme}
        viewMode={viewMode}
        maxWidth={maxWidth}
        hasStrikethroughs={hasStrikethroughs}
        onToggleView={toggleViewMode}
        onStrikethrough={handleStrikethrough}
        onStrikethroughPointerDown={handleStrikethroughPointerDown}
        onCleanStrikethroughs={handleCleanStrikethroughs}
        onExport={handleExport}
        onClear={handleClearRequest}
        onWidthChange={setMaxWidth}
        onSampleText={handleSampleTextRequest}
      />

      {/* Hold-Tab shortcut cheat sheet */}
      {tabHeld && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div
            className="rounded-2xl px-8 py-6 shadow-2xl border backdrop-blur-xl"
            style={{
              backgroundColor: `${currentTheme.background}cc`,
              borderColor: `${currentTheme.text}15`,
              color: currentTheme.text,
              maxWidth: 360,
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
              style={{ opacity: 0.5 }}
            >
              Keyboard Shortcuts
            </h3>
            <div
              className="grid gap-2 text-sm"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", gridTemplateColumns: "auto 1fr" }}
            >
              {[
                [isMac ? "⌘⇧X" : "Ctrl+Shift+X", "Strikethrough"],
                [isMac ? "⌘⇧K" : "Ctrl+Shift+K", "Clean struck text"],
                [isMac ? "⌘⇧P" : "Ctrl+Shift+P", "Toggle preview"],
                [isMac ? "⌘⇧E" : "Ctrl+Shift+E", "Export markdown"],
                ["1 – 9", "Toggle word types"],
              ].map(([key, desc]) => (
                <React.Fragment key={key}>
                  <span
                    className="font-bold text-right pr-3"
                    style={{ color: currentTheme.accent, opacity: 0.85 }}
                  >
                    {key}
                  </span>
                  <span style={{ opacity: 0.7 }}>{desc}</span>
                </React.Fragment>
              ))}
            </div>
            <p
              className="text-[10px] text-center mt-4 uppercase tracking-widest"
              style={{ opacity: 0.3 }}
            >
              Release Tab to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
