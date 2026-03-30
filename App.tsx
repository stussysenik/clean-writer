import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
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
import { SHORTCUTS } from "./constants/shortcuts";
import { countWords } from "./services/localSyntaxService";
import {
  SyntaxAnalysis,
  SyntaxSets,
  ViewMode,
  HighlightConfig,
  toSyntaxSets,
  SongAnalysis,
  FocusMode,
  ColorEditTarget,
} from "./types";
import QuickColorPicker from "./components/ColorPicker/QuickColorPicker";
import { useSyntaxWorker } from "./hooks/useSyntaxWorker";
import { useAppHotkeys } from "./hooks/useAppHotkeys";
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
import HelpModal from "./components/HelpModal";
import MobileWelcome from "./components/MobileWelcome";

import Kbd from "./components/Kbd";
import { IconSettings } from "./components/Toolbar/Icons";
import useCustomTheme from "./hooks/useCustomTheme";
import useCustomThemes from "./hooks/useCustomThemes";
import useThemeVisibility from "./hooks/useThemeVisibility";
import useSelectionPersistence from "./hooks/useSelectionPersistence";
import { getIconColor } from "./utils/contrastAwareColor";
import {
  applyStrikethrough,
  hasStrikethroughBlocks,
  removeStrikethroughBlocks,
} from "./utils/strikethroughUtils";
import { useFocusNavigation } from "./hooks/useFocusNavigation";
import { initOverlapDebug } from "./utils/overlapDebug";
import useResponsiveBreakpoint from "./hooks/useResponsiveBreakpoint";
import { useMobileEditState } from "./hooks/useMobileEditState";
import { oklchInterpolate } from "./utils/oklch";
import DocumentSidebar from "./components/DocumentSidebar";
import { useAutoSave } from "./hooks/useAutoSave";
import { useDocumentManager } from "./hooks/useDocumentManager";
import { useWritingSession } from "./hooks/useWritingSession";
import { countChars } from "./services/textStatsService";

const UTF8_DISPLAY_STORAGE_KEY = "clean_writer_utf8_display_enabled";
const SHOW_LINE_WIDTH_SLIDER = false;

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
      // Accept both preset and custom_ theme IDs
      if (saved && (THEMES.some((t) => t.id === saved) || saved.startsWith("custom_"))) {
        return saved;
      }
      return "classic";
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

  const [fontSizeOffset, setFontSizeOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_font_size_offset");
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= -6 && val <= 12) return val;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [lineHeightValue, setLineHeightValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_line_height");
      return saved ? Number(saved) : 1.6;
    } catch {
      return 1.6;
    }
  });

  const [letterSpacing, setLetterSpacing] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_letter_spacing");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [paragraphSpacing, setParagraphSpacing] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_paragraph_spacing");
      return saved ? Number(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });

  const [focusMode, setFocusMode] = useState<FocusMode>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_focus_mode") as FocusMode | null;
      if (saved === "sentence" || saved === "word" || saved === "paragraph") return saved;
      return "none";
    } catch {
      return "none";
    }
  });

  const [customThemeNames, setCustomThemeNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("clean_writer_theme_names");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      }
      return {};
    } catch {
      return {};
    }
  });

  const fluidFontSize = fontSizeOffset === 0
    ? "clamp(18px, 10px + 1.1vw, 24px)"
    : `calc(clamp(18px, 10px + 1.1vw, 24px) + ${fontSizeOffset}px)`;

  const handleFontSizeChange = useCallback((offset: number) => {
    const clamped = Math.max(-6, Math.min(12, offset));
    setFontSizeOffset(clamped);
  }, []);

  const handleSelectThemeForEditing = useCallback((id: string) => {
    setThemeId(id);
    setCustomizerInitialTab("themes");
  }, []);

  // Color edit handlers — bridge PanelBody → ThemeCustomizer
  const handleEditColor = useCallback((target: ColorEditTarget) => {
    setIsCustomizerOpen(true);
    setCustomizerInitialTab("themes");
    // Scroll to the target color after the panel opens
    requestAnimationFrame(() => {
      setTimeout(() => {
        let elementId: string | null = null;
        if (target.type === "syntax") {
          elementId = `theme-color-${target.key}`;
        } else if (target.type === "rhyme") {
          elementId = `rhyme-color-${target.index}`;
        }
        if (elementId) {
          document.getElementById(elementId)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300); // wait for panel open animation
    });
  }, []);

  const handleQuickEditColor = useCallback(
    (target: ColorEditTarget, anchorEl: HTMLElement) => {
      setQuickColorPickerState({ target, anchorEl });
    },
    [],
  );


  const handleThemeRename = useCallback((themeId: string, newName: string) => {
    setCustomThemeNames(prev => {
      const next = { ...prev };
      if (newName.trim()) {
        next[themeId] = newName.trim();
      } else {
        delete next[themeId];
      }
      return next;
    });
  }, []);

  const cycleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const order: FocusMode[] = ["none", "word", "sentence", "paragraph"];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
  }, []);

  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerInitialTab, setCustomizerInitialTab] = useState<string | null>(null);
  const [quickColorPickerState, setQuickColorPickerState] = useState<{
    target: ColorEditTarget;
    anchorEl: HTMLElement;
  } | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showMobileWelcome, setShowMobileWelcome] = useState(false);
  const [utf8DisplayEnabled, setUtf8DisplayEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(UTF8_DISPLAY_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Dedicated song view state
  const [songMode, setSongMode] = useState(false);

  // Code mode state
  const [codeMode, setCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  // Unstylized (plain text) mode
  const [unstylizedMode, setUnstylizedMode] = useState(() => {
    try {
      return localStorage.getItem("clean_writer_unstylized_mode") === "true";
    } catch {
      return false;
    }
  });

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

  // ─── Platform: Selection counting, Sidebar, Document Management ───
  const [selectionCharCount, setSelectionCharCount] = useState(0);
  const [selectionWordCount, setSelectionWordCount] = useState(0);
  const [showCharCounts, setShowCharCounts] = useState(() => {
    try { return localStorage.getItem("clean_writer_char_counts") === "true"; } catch { return false; }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const { lastSavedAt, save: autoSave } = useAutoSave();
  const {
    projects, documents, journalEntries,
    createProject, createDocument, createJournalEntry,
    deleteDocument,
  } = useDocumentManager();
  const { recordActivity } = useWritingSession();

  // Saved custom themes hook
  const {
    savedThemes: savedCustomThemes,
    addTheme: addCustomTheme,
    deleteTheme: deleteCustomTheme,
    renameTheme: renameCustomTheme,
    getTheme: getCustomTheme,
  } = useCustomThemes();

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
    hasOverridesForTheme,
  } = useCustomTheme(themeId, savedCustomThemes);

  const handleQuickColorChange = useCallback(
    (target: ColorEditTarget, color: string) => {
      if (target.type === "syntax") {
        setColor(target.key, color);
      } else if (target.type === "rhyme") {
        setRhymeColor(target.index, color);
      } else if (target.type === "editor") {
        setColor(target.key, color);
      }
    },
    [setColor, setRhymeColor],
  );

  // Compute effective rhyme colors: prefer current theme's OKLCH-derived rhymeColors,
  // then custom theme overrides, then static fallback
  const customThemeEntry = savedCustomThemes.find((t) => t.id === themeId);
  const presetTheme = THEMES.find((t) => t.id === themeId);
  const effectiveRhymeColors = useMemo(
    () => {
      const defaults = presetTheme?.rhymeColors || customThemeEntry?.rhymeColors || RHYME_COLORS;
      return defaults.map((def, i) => rhymeColorOverrides?.[i] ?? def);
    },
    [rhymeColorOverrides, customThemeEntry, presetTheme?.rhymeColors],
  );

  // Use theme visibility hook
  const {
    hiddenThemeIds,
    hideTheme,
    toggleThemeVisibility,
    orderedThemes,
    reorderThemes,
    themeOrder,
  } = useThemeVisibility(savedCustomThemes);

  const handleSaveCustomTheme = useCallback(
    (name: string, theme: import("./types").RisoTheme, rhymeColors?: string[]) => {
      const saved = addCustomTheme(name, theme, rhymeColors);
      if (saved) {
        setThemeId(saved.id);
      }
      return saved;
    },
    [addCustomTheme],
  );

  const handleDeleteCustomTheme = useCallback(
    (id: string) => {
      deleteCustomTheme(id);
      // If the deleted theme was active, fall back to first preset
      if (themeId === id) {
        setThemeId(THEMES[0].id);
      }
    },
    [deleteCustomTheme, themeId],
  );

  // Textarea ref for selection persistence
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Web Worker for background NLP processing
  const { analyze: analyzeInWorker, analyzeSong: analyzeSongInWorker } =
    useSyntaxWorker();

  // Selection persistence for mobile strikethrough
  const { saveSelection, getSavedSelection, restoreSelection, savedSelection, clearSelection } =
    useSelectionPersistence(textareaRef);

  // Selection char counter — tracks selected text length
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const update = () => {
      const s = textarea.selectionStart ?? 0;
      const e = textarea.selectionEnd ?? 0;
      if (s !== e) {
        const sel = textarea.value.slice(Math.min(s, e), Math.max(s, e));
        setSelectionCharCount(countChars(sel));
        setSelectionWordCount(countWords(sel));
      } else {
        setSelectionCharCount(0);
        setSelectionWordCount(0);
      }
    };
    textarea.addEventListener("keyup", update);
    textarea.addEventListener("mouseup", update);
    textarea.addEventListener("touchend", update);
    document.addEventListener("selectionchange", update);
    return () => {
      textarea.removeEventListener("keyup", update);
      textarea.removeEventListener("mouseup", update);
      textarea.removeEventListener("touchend", update);
      document.removeEventListener("selectionchange", update);
    };
  }, []);

  // Toast state for last-theme warning
  const [showLastThemeToast, setShowLastThemeToast] = useState(false);
  // Toast state for export success
  const [showExportToast, setShowExportToast] = useState(false);
  // Toast state for custom theme operations
  const [customThemeToast, setCustomThemeToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  const handleShowToast = useCallback((message: string, type: "success" | "warning" = "success") => {
    setCustomThemeToast({ message, type });
  }, []);

  const currentTheme = effectiveTheme;

  const currentFont =
    FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0];
  const displayFontFamily = useMemo(
    () =>
      `${currentFont.family}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Malgun Gothic", sans-serif`,
    [currentFont.family],
  );
  const wordCount = countWords(content);

  // Auto-save + writing session tracking
  useEffect(() => {
    autoSave(content, activeDocumentId ?? undefined);
    recordActivity(wordCount);
  }, [content, activeDocumentId, autoSave, recordActivity, wordCount]);

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

  // Handle theme change
  const handleThemeChange = useCallback((id: string) => {
    setThemeId(id);
  }, []);

  // Keyboard shortcuts moved to useAppHotkeys (called after all callbacks are declared)

  // Responsive breakpoint for desktop panel padding & shortcut overlay
  const { isDesktop, isMobile } = useResponsiveBreakpoint();

  // Mobile edit/view state for visual distinction
  const mobileEditState = useMobileEditState(textareaRef, isMobile);

  // Warm background tint when editing on mobile (5% shift towards a warm tone)
  const mobileBackground = useMemo(() => {
    if (unstylizedMode) return "#FFFFFF";
    if (!isMobile || mobileEditState !== "editing") return currentTheme.background;
    return oklchInterpolate(currentTheme.background, "#FFF0E0", 0.05);
  }, [isMobile, mobileEditState, currentTheme.background, unstylizedMode]);

  // First-time mobile welcome popup
  useEffect(() => {
    if (!isMobile) return;
    try {
      if (localStorage.getItem("clean_writer_mobile_welcome_seen") === "true") return;
    } catch { return; }
    const timer = setTimeout(() => setShowMobileWelcome(true), 1000);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const dismissMobileWelcome = useCallback(() => {
    setShowMobileWelcome(false);
    try {
      localStorage.setItem("clean_writer_mobile_welcome_seen", "true");
    } catch {}
  }, []);

  // Tab hold state managed by useAppHotkeys (called after all callbacks are declared)

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

  // Content persistence handled by useAutoSave hook

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

  // Persist unstylizedMode
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_unstylized_mode", String(unstylizedMode));
    } catch (e) {
      console.warn("Could not save unstylized mode");
    }
  }, [unstylizedMode]);

  // Persist showCharCounts
  useEffect(() => {
    try { localStorage.setItem("clean_writer_char_counts", String(showCharCounts)); } catch {}
  }, [showCharCounts]);

  // Persist soloMode
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_solo_mode", soloMode || "null");
    } catch (e) {
      console.warn("Could not save solo mode");
    }
  }, [soloMode]);

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

  // Persist fontSizeOffset
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_font_size_offset", String(fontSizeOffset));
    } catch (e) {
      console.warn("Could not save font size offset");
    }
  }, [fontSizeOffset]);

  // Persist lineHeight
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_line_height", String(lineHeightValue));
    } catch (e) {
      console.warn("Could not save line height");
    }
  }, [lineHeightValue]);

  // Persist letterSpacing
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_letter_spacing", String(letterSpacing));
    } catch (e) {
      console.warn("Could not save letter spacing");
    }
  }, [letterSpacing]);

  // Persist paragraphSpacing
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_paragraph_spacing", String(paragraphSpacing));
    } catch (e) {
      console.warn("Could not save paragraph spacing");
    }
  }, [paragraphSpacing]);

  // Persist focusMode
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_focus_mode", focusMode);
    } catch (e) {
      console.warn("Could not save focus mode");
    }
  }, [focusMode]);

  // Persist customThemeNames
  useEffect(() => {
    try {
      localStorage.setItem("clean_writer_theme_names", JSON.stringify(customThemeNames));
    } catch (e) {
      console.warn("Could not save theme names");
    }
  }, [customThemeNames]);

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

  // Song analysis (runs only while the dedicated song view is active)
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

  const toggleUnstylizedMode = useCallback(() => {
    setUnstylizedMode((prev) => {
      if (!prev) {
        setSongMode(false);
        setCodeMode(false);
      }
      return !prev;
    });
  }, []);

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

  // Focus navigation hook
  const {
    focusNavState,
    handleFocusKeyDown,
    applyStrikethroughAtFocus,
    focusAtTextIndex,
  } = useFocusNavigation({
    content,
    focusMode,
    setFocusMode,
    setContent,
  });

  // Wrap handleStrikethrough to use focus-at-cursor when navigating
  const handleStrikethroughWithFocus = useCallback(() => {
    if (focusNavState.isNavigating && focusNavState.focusedRange) {
      applyStrikethroughAtFocus();
    } else {
      handleStrikethrough();
    }
  }, [focusNavState, applyStrikethroughAtFocus, handleStrikethrough]);

  // Centralized keyboard shortcuts via TanStack Hotkeys
  // Called after all callbacks are declared — useHotkey auto-syncs each render (no stale closures)
  const { tabHeld } = useAppHotkeys({
    toggleHighlight,
    handleStrikethroughWithFocus,
    handleCleanStrikethroughs,
    handleExport,
    handleClearRequest,
    setViewMode,
    cycleFocusMode,
    toggleUnstylizedMode,
    isMobile,
  });

  // Sidebar toggle: Mod+Shift+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "B") {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Capture-phase listener for arrow keys in focus mode (must fire before textarea)
  useEffect(() => {
    if (focusMode === "none") return;
    const handler = (e: KeyboardEvent) => {
      // Only intercept arrow keys and Escape in focus mode
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(e.key)) {
        handleFocusKeyDown(e);
      }
    };
    window.addEventListener("keydown", handler, true); // capture phase
    return () => window.removeEventListener("keydown", handler, true);
  }, [focusMode, handleFocusKeyDown]);

  return (
    <div
      className="w-full h-[100dvh] flex flex-col relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: unstylizedMode ? "#FFFFFF" : (isMobile ? mobileBackground : currentTheme.background),
        color: currentTheme.text,
        fontFamily: displayFontFamily,
      }}
    >
      {/* Document Sidebar */}
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        documents={documents}
        journalEntries={journalEntries}
        activeDocumentId={activeDocumentId}
        onSelectDocument={(id) => {
          setActiveDocumentId(id);
          const doc = documents.find(d => d.id === id);
          if (doc) setContent(doc.content);
          setIsSidebarOpen(false);
        }}
        onCreateProject={(title) => createProject(title)}
        onCreateDocument={(projectId, title) => createDocument(projectId, title, "standalone")}
        onCreateJournalEntry={() => createJournalEntry()}
        onDeleteDocument={(id) => deleteDocument(id)}
        textColor={currentTheme.text}
        bgColor={currentTheme.background}
        accentColor={currentTheme.accent}
      />

      {/* Background Texture */}
      <div
        data-overlap-ignore
        className={`absolute inset-0 pointer-events-none ${unstylizedMode ? 'opacity-0' : 'opacity-20'} mix-blend-multiply z-0`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top fade — navbar visual zone */}
      <div
        data-overlap-ignore
        className="absolute top-0 left-0 right-0 h-[144px] pointer-events-none z-[59]"
        style={{
          background: `linear-gradient(to bottom, ${unstylizedMode ? "#FFFFFF" : currentTheme.background} 0%, ${unstylizedMode ? "#FFFFFF" : currentTheme.background}00 100%)`,
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

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        theme={currentTheme}
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
        hiddenThemeIds={hiddenThemeIds}
        onToggleThemeVisibility={toggleThemeVisibility}
        utf8DisplayEnabled={utf8DisplayEnabled}
        onToggleUtf8Display={setUtf8DisplayEnabled}
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
        customThemeNames={customThemeNames}
        onThemeRename={handleThemeRename}
        onSelectThemeForEditing={handleSelectThemeForEditing}
        hasOverridesForTheme={hasOverridesForTheme}
        initialTab={customizerInitialTab}
        onInitialTabConsumed={() => setCustomizerInitialTab(null)}
          savedCustomThemes={savedCustomThemes}
        onSaveCustomTheme={handleSaveCustomTheme}
        onDeleteCustomTheme={handleDeleteCustomTheme}
        onRenameCustomTheme={renameCustomTheme}
        isCustomTheme={themeId.startsWith("custom_")}
        onShowToast={handleShowToast}
        letterSpacing={letterSpacing}
        onLetterSpacingChange={setLetterSpacing}
        lineHeight={lineHeightValue}
        onLineHeightChange={setLineHeightValue}
      />

      {/* Quick Color Picker popover (long-press on color dots) */}
      {quickColorPickerState && (
        <QuickColorPicker
          target={quickColorPickerState.target}
          currentColor={
            quickColorPickerState.target.type === "syntax"
              ? currentTheme.highlight[quickColorPickerState.target.key]
              : quickColorPickerState.target.type === "rhyme"
                ? (effectiveRhymeColors[quickColorPickerState.target.index] ?? "#888888")
                : quickColorPickerState.target.type === "editor"
                  ? currentTheme[quickColorPickerState.target.key]
                  : "#888888"
          }
          anchorEl={quickColorPickerState.anchorEl}
          theme={currentTheme}
          onSetColor={handleQuickColorChange}
          onOpenFull={(target) => {
            setQuickColorPickerState(null);
            handleEditColor(target);
          }}
          onClose={() => setQuickColorPickerState(null)}
        />
      )}

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

      {/* Toast for custom theme operations */}
      <Toast
        message={customThemeToast?.message || ""}
        isVisible={!!customThemeToast}
        onDismiss={() => setCustomThemeToast(null)}
        type={customThemeToast?.type || "success"}
      />

      {/* Top Bar with Theme Selector and Settings */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-[13px] md:p-[21px] z-[60] pointer-events-none">
        {!unstylizedMode && (
          <div className="pointer-events-auto flex items-center min-h-[44px] min-w-0 flex-1 mr-2">
            <ThemeSelector
              currentTheme={currentTheme}
              themeId={themeId}
              onThemeChange={handleThemeChange}
              hiddenThemeIds={hiddenThemeIds}
              orderedThemes={orderedThemes}
              hasOverridesForTheme={hasOverridesForTheme}
            />
          </div>
        )}
        {unstylizedMode && <div className="flex-1" />}
        {/* Hidden when customizer open — customizer has its own close (X) button */}
        {!isCustomizerOpen && (
          <div className="pointer-events-auto flex items-center gap-1.5 min-h-[44px]">
            {/* Font Size A-/A+ Controls — segmented pill */}
            {!unstylizedMode && <div
              className="flex items-center gap-0 rounded-lg overflow-hidden"
              style={{
                backgroundColor: `${currentTheme.background}80`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <TouchButton
                onClick={() => handleFontSizeChange(fontSizeOffset - 2)}
                disabled={fontSizeOffset <= -6}
                className={`px-1.5 py-0.5 text-xs font-bold transition-all ${
                  fontSizeOffset <= -6 ? "opacity-25 cursor-not-allowed" : "opacity-60 hover:opacity-100 hover:bg-current/5"
                }`}
                style={{ color: currentTheme.text }}
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                A−
              </TouchButton>
              <TouchButton
                onClick={() => handleFontSizeChange(0)}
                disabled={fontSizeOffset === 0}
                className={`px-1.5 py-0.5 text-[10px] font-medium tabular-nums transition-all ${
                  fontSizeOffset === 0 ? "opacity-25 cursor-not-allowed" : "opacity-60 hover:opacity-100 hover:bg-current/5"
                }`}
                style={{ color: currentTheme.text, minWidth: "24px", textAlign: "center" }}
                aria-label="Reset font size"
                title="Reset font size"
              >
                {fontSizeOffset === 0 ? "0" : fontSizeOffset > 0 ? `+${fontSizeOffset}` : `${fontSizeOffset}`}
              </TouchButton>
              <TouchButton
                onClick={() => handleFontSizeChange(fontSizeOffset + 2)}
                disabled={fontSizeOffset >= 12}
                className={`px-1.5 py-0.5 text-xs font-bold transition-all ${
                  fontSizeOffset >= 12 ? "opacity-25 cursor-not-allowed" : "opacity-60 hover:opacity-100 hover:bg-current/5"
                }`}
                style={{ color: currentTheme.text }}
                aria-label="Increase font size"
                title="Increase font size"
              >
                A+
              </TouchButton>
            </div>}
            <Tooltip content="Help & Shortcuts" position="bottom">
              <TouchButton
                onClick={() => setIsHelpOpen(true)}
                className="p-1.5 rounded-xl hover:bg-current/5 transition-all duration-200"
                aria-label="Help and shortcuts"
                style={{
                  color: unstylizedMode ? "#333333" : getIconColor(currentTheme),
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </TouchButton>
            </Tooltip>
            <Tooltip content={`Build ${BUILD_NUMBER} · ${BUILD_HASH}`} position="bottom">
              <TouchButton
                onClick={() => setIsCustomizerOpen(true)}
                className="p-1.5 rounded-xl hover:bg-current/5 transition-all duration-200"
                title="Customize Theme"
                data-testid="open-theme-customizer"
                style={{
                  color: unstylizedMode ? "#333333" : getIconColor(currentTheme),
                }}
              >
                <IconSettings />
              </TouchButton>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Main Area */}
      <main
        className="flex-1 w-full h-full relative z-10 pt-[70px] md:pt-[80px] lg:pt-[80px] transition-all duration-300 ease-in-out"
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
            onRestoreSelection={restoreSelection}
            songMode={songMode}
            songData={songData}
            rhymeColors={effectiveRhymeColors}
            showSyllableAnnotations={songMode && showSyllableAnnotations}
            rhymeHighlightRadius={rhymeHighlightRadius}
            rhymeBoldEnabled={rhymeBoldEnabled}
            focusedRhymeKey={focusedRhymeKey}
            hoveredRhymeKey={hoveredRhymeKey}
            disabledRhymeKeys={disabledRhymeKeys}
            letterSpacing={letterSpacing}
            lineHeight={lineHeightValue}
            focusMode={focusMode}
            focusNavState={focusNavState}
            isMobile={isMobile}
            onFocusTap={focusAtTextIndex}
            codeMode={codeMode}
            codeLanguage={codeLanguage}
            unstylizedMode={unstylizedMode}
            showCharCounts={showCharCounts}
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

      {/* Unified Syntax Panel — hidden in plain text mode */}
      {!unstylizedMode && <UnifiedSyntaxPanel
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
        onEditColor={handleEditColor}
        onQuickEditColor={handleQuickEditColor}
        codeMode={codeMode}
        onToggleCodeMode={() => {
          setCodeMode((prev) => !prev);
          if (!codeMode) setSongMode(false); // exit song mode when entering code mode
        }}
        codeLanguage={codeLanguage}
      />}

      {/* Floating Line Width Slider — centered in viewport */}
      {viewMode === "write" && SHOW_LINE_WIDTH_SLIDER && (
        <div
          className="absolute left-1/2 bottom-[21%] -translate-x-1/2 z-40 pointer-events-auto"
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{
              backgroundColor: `${currentTheme.background}80`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <input
              type="range"
              min="300"
              max="1400"
              step="50"
              value={maxWidth}
              onChange={(e) => setMaxWidth(Number(e.target.value))}
              className="w-36 md:w-44 h-1 rounded-lg appearance-none cursor-pointer touch-manipulation"
              style={{
                accentColor: currentTheme.accent,
                background: `linear-gradient(to right, ${currentTheme.accent} 0%, ${currentTheme.accent} ${((maxWidth - 300) / 1100) * 100}%, ${currentTheme.text}20 ${((maxWidth - 300) / 1100) * 100}%, ${currentTheme.text}20 100%)`,
              }}
              aria-label="Line width"
              title="Line width"
            />
            <span
              className="text-[11px] opacity-50 tabular-nums font-mono pointer-events-none"
              style={{ color: currentTheme.text }}
            >
              {maxWidth}px
            </span>
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <Toolbar
        theme={currentTheme}
        viewMode={viewMode}
        hasStrikethroughs={hasStrikethroughs}
        focusMode={focusMode}
        dimmed={isMobile && mobileEditState === "viewing"}
        onToggleView={toggleViewMode}
        onStrikethrough={handleStrikethroughWithFocus}
        onStrikethroughPointerDown={handleStrikethroughPointerDown}
        onCleanStrikethroughs={handleCleanStrikethroughs}
        onExport={handleExport}
        onClear={handleClearRequest}
        onSampleText={handleSampleTextRequest}
        onCycleFocusMode={cycleFocusMode}
        unstylizedMode={unstylizedMode}
        onToggleUnstylized={toggleUnstylizedMode}
        selectionCharCount={selectionCharCount}
        selectionWordCount={selectionWordCount}
        showCharCounts={showCharCounts}
        onToggleCharCounts={() => setShowCharCounts(prev => !prev)}
      />

      {/* Mobile Welcome Popup */}
      {showMobileWelcome && (
        <MobileWelcome theme={currentTheme} onDismiss={dismissMobileWelcome} />
      )}

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
              className="grid gap-3 text-sm items-center"
              style={{ gridTemplateColumns: "auto 1fr" }}
            >
              {/* Editing & View shortcuts from registry */}
              {SHORTCUTS
                .filter((s) => s.category === "editing" || s.category === "view")
                .map((s) => (
                  <React.Fragment key={s.id}>
                    <span className="text-right pr-3">
                      <Kbd theme={currentTheme}>{formatForDisplay(s.hotkey)}</Kbd>
                    </span>
                    <span style={{ opacity: 0.7 }}>{s.label}</span>
                  </React.Fragment>
                ))}
              {/* Word types grouped */}
              <React.Fragment key="wordtypes">
                <span className="text-right pr-3">
                  <Kbd theme={currentTheme}>1 – 9</Kbd>
                </span>
                <span style={{ opacity: 0.7 }}>Toggle word types</span>
              </React.Fragment>
              {/* Focus navigation */}
              {([
                ["← →", "Navigate in focus mode"],
                ["↑ ↓", "Change focus level"],
                [formatForDisplay("Escape"), "Exit focus mode"],
              ] as const).map(([key, desc]) => (
                <React.Fragment key={key}>
                  <span className="text-right pr-3">
                    <Kbd theme={currentTheme}>{key}</Kbd>
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
