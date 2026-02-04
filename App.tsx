import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
        THEMES,
        THEME_STORAGE_KEY,
        FONT_OPTIONS,
        FONT_STORAGE_KEY,
        FontId,
} from "./constants";
import { countWords } from "./services/localSyntaxService";
import { SyntaxAnalysis, SyntaxSets, ViewMode, HighlightConfig, toSyntaxSets } from "./types";
import { useSyntaxWorker } from "./hooks/useSyntaxWorker";
import Typewriter from "./components/Typewriter";
import MarkdownPreview from "./components/MarkdownPreview";
import ConfirmDialog from "./components/ConfirmDialog";
import Toolbar from "./components/Toolbar";
import ThemeSelector from "./components/Toolbar/ThemeSelector";
import ThemeCustomizer from "./components/ThemeCustomizer";
import UnifiedSyntaxPanel from "./components/UnifiedSyntaxPanel";
import DragGhost from "./components/DragGhost";
import AnimatedTrashBin, { TrashBinState } from "./components/AnimatedTrashBin";
import Toast from "./components/Toast";
import TouchButton from "./components/TouchButton";
import { IconSettings } from "./components/Toolbar/Icons";
import useCustomTheme from "./hooks/useCustomTheme";
import useCustomPalettes, { SavedPalette } from "./hooks/useCustomPalettes";
import useThemeVisibility from "./hooks/useThemeVisibility";
import useVirtualKeyboard from "./hooks/useVirtualKeyboard";
import useSelectionPersistence from "./hooks/useSelectionPersistence";
import { getIconColor } from "./utils/contrastAwareColor";
import { applyStrikethrough } from "./utils/strikethroughUtils";

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

const App: React.FC = () => {
        const [content, setContent] = useState<string>(() => {
                try {
                        return localStorage.getItem("riso_flow_content") || "";
                } catch (e) {
                        console.warn("Could not access local storage");
                        return "";
                }
        });

        const [maxWidth, setMaxWidth] = useState<number>(() => {
                try {
                        const saved = localStorage.getItem(
                                "riso_flow_max_width",
                        );
                        return saved ? parseInt(saved, 10) : 800;
                } catch {
                        return 800;
                }
        });

        const [themeId, setThemeId] = useState<string>(() => {
                try {
                        const saved = localStorage.getItem(THEME_STORAGE_KEY);
                        return saved && THEMES.some((t) => t.id === saved)
                                ? saved
                                : "classic";
                } catch {
                        return "classic";
                }
        });

        const [fontId, setFontId] = useState<FontId>(() => {
                try {
                        const saved = localStorage.getItem(
                                FONT_STORAGE_KEY,
                        ) as FontId | null;
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
                        return saved === "write" || saved === "preview"
                                ? saved
                                : "write";
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
        };

        const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>(
                () => {
                        try {
                                const saved = localStorage.getItem(
                                        "clean_writer_highlight_config",
                                );
                                if (saved) {
                                        const parsed = JSON.parse(saved);
                                        // Validate the shape of the parsed object
                                        if (
                                                typeof parsed === "object" &&
                                                "nouns" in parsed
                                        ) {
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

        const [fontSize, setFontSize] = useState(24);
        const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
        const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

        // Solo mode state
        const [soloMode, setSoloMode] = useState<keyof HighlightConfig | null>(
                () => {
                        try {
                                const saved = localStorage.getItem(
                                        "clean_writer_solo_mode",
                                );
                                if (saved && saved !== "null") {
                                        const validKeys: (keyof HighlightConfig)[] =
                                                [
                                                        "nouns",
                                                        "pronouns",
                                                        "verbs",
                                                        "adjectives",
                                                        "adverbs",
                                                        "prepositions",
                                                        "conjunctions",
                                                        "articles",
                                                        "interjections",
                                                ];
                                        return validKeys.includes(
                                                saved as keyof HighlightConfig,
                                        )
                                                ? (saved as keyof HighlightConfig)
                                                : null;
                                }
                                return null;
                        } catch {
                                return null;
                        }
                },
        );

        // Active custom palette state
        const [activePaletteId, setActivePaletteId] = useState<string | null>(
                () => {
                        try {
                                const saved = localStorage.getItem(
                                        "clean_writer_active_palette",
                                );
                                return saved && saved !== "null" ? saved : null;
                        } catch {
                                return null;
                        }
                },
        );

        // First-visit tracking for syntax panel (mobile hint animation)
        const [hasSeenSyntaxPanel, setHasSeenSyntaxPanel] = useState<boolean>(
                () => {
                        try {
                                return localStorage.getItem("seen_syntax_panel") === "true";
                        } catch {
                                return false;
                        }
                },
        );

        // Hovered category state for word glow effect
        const [hoveredCategory, setHoveredCategory] = useState<keyof HighlightConfig | null>(null);

        // Use custom theme hook
        const {
                effectiveTheme,
                hasCustomizations,
                setColor,
                resetToPreset,
                resetColor,
                isColorCustomized,
        } = useCustomTheme(themeId);

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
        } = useThemeVisibility();

        // Textarea ref for selection persistence
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        // Web Worker for background NLP processing
        const { analyze: analyzeInWorker } = useSyntaxWorker();

        // Virtual keyboard detection
        const { isKeyboardOpen: keyboardOpen } = useVirtualKeyboard();

        // Selection persistence for mobile strikethrough
        const { saveSelection, getSavedSelection, clearSelection } = useSelectionPersistence(textareaRef);

        // Enhanced drag state with position tracking
        const [dragState, setDragState] = useState<{
                isDragging: boolean;
                draggedTheme: { id: string; color: string; isPreset: boolean } | null;
                position: { x: number; y: number };
                originalPosition: { x: number; y: number };
                isOverTrash: boolean;
        }>({
                isDragging: false,
                draggedTheme: null,
                position: { x: 0, y: 0 },
                originalPosition: { x: 0, y: 0 },
                isOverTrash: false,
        });

        // Trash bin animation state
        const [trashState, setTrashState] = useState<TrashBinState>('hidden');

        // Toast state for last-theme warning
        const [showLastThemeToast, setShowLastThemeToast] = useState(false);

        // Animation states for delete sequence
        const [isDeleting, setIsDeleting] = useState(false);
        const [isRejected, setIsRejected] = useState(false);

        // Filter visible themes (used for last-theme check)
        const visibleThemes = useMemo(
                () => orderedThemes.filter((t) => !hiddenThemeIds.includes(t.id)),
                [orderedThemes, hiddenThemeIds],
        );

        // Check if pointer is over trash zone
        const checkTrashZoneHit = useCallback((clientY: number) => {
                const screenHeight = window.innerHeight;
                return clientY > screenHeight - 140;
        }, []);

        // Enhanced drag handlers
        const handleDragStart = useCallback((
                themeInfo: { id: string; color: string; isPreset: boolean },
                position: { x: number; y: number }
        ) => {
                setDragState({
                        isDragging: true,
                        draggedTheme: themeInfo,
                        position,
                        originalPosition: position,
                        isOverTrash: false,
                });
                setTrashState('idle');
                setIsDeleting(false);
                setIsRejected(false);
        }, []);

        const handleDragMove = useCallback((position: { x: number; y: number }) => {
                const isOverTrash = checkTrashZoneHit(position.y);
                setDragState(prev => ({
                        ...prev,
                        position,
                        isOverTrash,
                }));
                setTrashState(isOverTrash ? 'hover' : 'idle');
        }, [checkTrashZoneHit]);

        const handleDragEnd = useCallback(() => {
                const { isDragging, draggedTheme, isOverTrash } = dragState;

                if (!isDragging || !draggedTheme) {
                        setDragState(prev => ({
                                ...prev,
                                isDragging: false,
                                draggedTheme: null,
                                isOverTrash: false,
                        }));
                        setTrashState('hidden');
                        return;
                }

                if (isOverTrash) {
                        // Check if this is the last theme/palette
                        const canDelete = draggedTheme.isPreset
                                ? visibleThemes.length > 1
                                : true; // Custom palettes can always be deleted

                        if (!canDelete) {
                                // Reject: last theme can't be deleted
                                setIsRejected(true);
                                setTrashState('rejecting');
                                setShowLastThemeToast(true);

                                // Reset after bounce-back animation
                                setTimeout(() => {
                                        setDragState(prev => ({
                                                ...prev,
                                                isDragging: false,
                                                draggedTheme: null,
                                                isOverTrash: false,
                                        }));
                                        setTrashState('hidden');
                                        setIsRejected(false);
                                }, 600);
                        } else {
                                // Accept: trigger swallow animation
                                setIsDeleting(true);
                                setTrashState('swallowing');
                        }
                } else {
                        // Not over trash, just end drag
                        setDragState(prev => ({
                                ...prev,
                                isDragging: false,
                                draggedTheme: null,
                                isOverTrash: false,
                        }));
                        setTrashState('hidden');
                }
        }, [dragState, visibleThemes.length]);

        // Handle swallow animation completion - actually delete the item
        const handleSwallowComplete = useCallback(() => {
                const { draggedTheme } = dragState;

                if (draggedTheme) {
                        if (draggedTheme.isPreset) {
                                hideTheme(draggedTheme.id);
                        } else {
                                deletePalette(draggedTheme.id);
                        }
                }

                setDragState(prev => ({
                        ...prev,
                        isDragging: false,
                        draggedTheme: null,
                        isOverTrash: false,
                }));
                setTrashState('hidden');
                setIsDeleting(false);
        }, [dragState, hideTheme, deletePalette]);

        // Derived values for compatibility with ThemeSelector
        const isDragging = dragState.isDragging;
        const isDraggingOverTrash = dragState.isOverTrash;

        // Get current theme - either from custom palette or from theme customizer
        const currentTheme = useMemo(() => {
                if (activePaletteId) {
                        const palette = visiblePalettes.find(
                                (p) => p.id === activePaletteId,
                        );
                        if (palette) {
                                return applyPalette(palette);
                        }
                }
                return effectiveTheme;
        }, [activePaletteId, visiblePalettes, applyPalette, effectiveTheme]);

        const currentFont =
                FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0];
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
                };
        }, [soloMode, highlightConfig]);

        // Convert syntaxData arrays to Sets for O(1) lookup performance
        const syntaxSets = useMemo(
                () => toSyntaxSets(syntaxData),
                [syntaxData]
        );

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
        const handleSoloToggle = useCallback(
                (key: keyof HighlightConfig | null) => {
                        setSoloMode(key);
                },
                [],
        );

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
                        const baseTheme =
                                THEMES.find((t) => t.id === themeId) ||
                                THEMES[0];
                        const overrides: SavedPalette["overrides"] = {};

                        if (
                                effectiveTheme.background !==
                                baseTheme.background
                        ) {
                                overrides.background =
                                        effectiveTheme.background;
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
                        const highlightOverrides: Partial<
                                typeof baseTheme.highlight
                        > = {};
                        (
                                Object.keys(
                                        baseTheme.highlight,
                                ) as (keyof typeof baseTheme.highlight)[]
                        ).forEach((key) => {
                                if (
                                        effectiveTheme.highlight[key] !==
                                        baseTheme.highlight[key]
                                ) {
                                        highlightOverrides[key] =
                                                effectiveTheme.highlight[key];
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
                return () =>
                        window.removeEventListener("keydown", handleKeyDown);
        }, [toggleHighlight]);

        // Responsive Font Size
        useEffect(() => {
                const handleResize = () => {
                        const isMobile = window.innerWidth < 768;
                        setFontSize(isMobile ? 18 : 24);
                };

                window.addEventListener("resize", handleResize);
                handleResize();

                return () => window.removeEventListener("resize", handleResize);
        }, []);

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
                        localStorage.setItem(
                                "riso_flow_max_width",
                                maxWidth.toString(),
                        );
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
                        localStorage.setItem(
                                "clean_writer_view_mode",
                                viewMode,
                        );
                } catch (e) {
                        console.warn("Could not save view mode");
                }
        }, [viewMode]);

        // Persist soloMode
        useEffect(() => {
                try {
                        localStorage.setItem(
                                "clean_writer_solo_mode",
                                soloMode || "null",
                        );
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

        // Helper to merge new syntax data with existing data
        const updateSyntaxData = (newData: SyntaxAnalysis) => {
                setSyntaxData((prev) => ({
                        nouns: Array.from(
                                new Set([...prev.nouns, ...newData.nouns]),
                        ),
                        pronouns: Array.from(
                                new Set([
                                        ...prev.pronouns,
                                        ...newData.pronouns,
                                ]),
                        ),
                        verbs: Array.from(
                                new Set([...prev.verbs, ...newData.verbs]),
                        ),
                        adjectives: Array.from(
                                new Set([
                                        ...prev.adjectives,
                                        ...newData.adjectives,
                                ]),
                        ),
                        adverbs: Array.from(
                                new Set([...prev.adverbs, ...newData.adverbs]),
                        ),
                        prepositions: Array.from(
                                new Set([
                                        ...prev.prepositions,
                                        ...newData.prepositions,
                                ]),
                        ),
                        conjunctions: Array.from(
                                new Set([
                                        ...prev.conjunctions,
                                        ...newData.conjunctions,
                                ]),
                        ),
                        articles: Array.from(
                                new Set([
                                        ...prev.articles,
                                        ...newData.articles,
                                ]),
                        ),
                        interjections: Array.from(
                                new Set([
                                        ...prev.interjections,
                                        ...newData.interjections,
                                ]),
                        ),
                }));
        };

        // Syntax analysis (runs in Web Worker for better performance)
        useEffect(() => {
                const handler = setTimeout(async () => {
                        if (content.length > 0) {
                                try {
                                        const result = await analyzeInWorker(content);
                                        updateSyntaxData(result);
                                } catch (error) {
                                        console.warn('Syntax analysis failed:', error);
                                }
                        }
                }, 150); // Reduced from 500ms for faster feedback

                return () => clearTimeout(handler);
        }, [content, analyzeInWorker]);

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
                });
                setIsClearDialogOpen(false);
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

        return (
                <div
                        className="w-full h-[100dvh] flex flex-col relative overflow-x-hidden transition-colors duration-500"
                        style={{
                                backgroundColor: currentTheme.background,
                                color: currentTheme.text,
                                fontFamily: currentFont.family,
                        }}
                >
                        {/* Background Texture */}
                        <div
                                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
                                style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
                                }}
                        />

                        <ConfirmDialog
                                isOpen={isClearDialogOpen}
                                onConfirm={handleConfirmClear}
                                onCancel={() => setIsClearDialogOpen(false)}
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
                                onSavePalette={handleSavePalette}
                                hiddenThemeIds={hiddenThemeIds}
                                onToggleThemeVisibility={toggleThemeVisibility}
                        />

                        {/* Animated Trash Bin for deleting/hiding themes */}
                        <AnimatedTrashBin
                                isVisible={isDragging}
                                state={trashState}
                                onAnimationComplete={handleSwallowComplete}
                                themeColor={dragState.draggedTheme?.color}
                        />

                        {/* Drag Ghost - floating circle that follows cursor */}
                        <DragGhost
                                color={dragState.draggedTheme?.color || '#888'}
                                position={dragState.position}
                                isVisible={isDragging}
                                isOverTrash={isDraggingOverTrash}
                                isDeleting={isDeleting}
                                isRejected={isRejected}
                                originalPosition={dragState.originalPosition}
                        />

                        {/* Toast for warnings */}
                        <Toast
                                message="You need at least one theme"
                                isVisible={showLastThemeToast}
                                onDismiss={() => setShowLastThemeToast(false)}
                                type="warning"
                        />

                        {/* Top Bar with Theme Selector and Settings */}
                        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-30 pointer-events-none">
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
                                                onReorderThemes={reorderThemes}
                                                onDragStart={handleDragStart}
                                                onDragMove={handleDragMove}
                                                onDragEnd={handleDragEnd}
                                                isDraggingOverTrash={isDraggingOverTrash}
                                        />
                                </div>
                                <div className="pointer-events-auto flex items-center min-h-[44px]">
                                        <TouchButton
                                                onClick={() =>
                                                        setIsCustomizerOpen(
                                                                true,
                                                        )
                                                }
                                                className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                                                title="Customize Theme"
                                                style={{
                                                        color: getIconColor(
                                                                currentTheme,
                                                        ),
                                                }}
                                        >
                                                <IconSettings />
                                        </TouchButton>
                                </div>
                        </div>

                        {/* Main Area */}
                        <main className="flex-1 w-full h-full relative z-10 pt-16 md:pt-20 transition-all duration-300 ease-in-out">
                                {viewMode === "write" ? (
                                        <Typewriter
                                                content={content}
                                                setContent={setContent}
                                                theme={currentTheme}
                                                syntaxSets={syntaxSets}
                                                highlightConfig={
                                                        effectiveHighlightConfig
                                                }
                                                fontSize={fontSize}
                                                maxWidth={maxWidth}
                                                fontFamily={currentFont.family}
                                                textareaRef={textareaRef}
                                                hoveredCategory={hoveredCategory}
                                        />
                                ) : (
                                        <div
                                                className="mx-auto h-full relative z-10 transition-[max-width] duration-300 ease-in-out px-4 py-8 md:px-0 md:py-0"
                                                style={{ maxWidth: maxWidth }}
                                        >
                                                <MarkdownPreview
                                                        content={content}
                                                        theme={currentTheme}
                                                />
                                        </div>
                                )}
                        </main>

                        {/* Unified Syntax Panel */}
                        <UnifiedSyntaxPanel
                                content={content}
                                theme={currentTheme}
                                syntaxData={syntaxData}
                                highlightConfig={effectiveHighlightConfig}
                                onToggleHighlight={toggleHighlight}
                                soloMode={soloMode}
                                onSoloToggle={handleSoloToggle}
                                hasSeenPanel={hasSeenSyntaxPanel}
                                onPanelSeen={handleSyntaxPanelSeen}
                                onCategoryHover={setHoveredCategory}
                        />

                        {/* Bottom Toolbar */}
                        <Toolbar
                                theme={currentTheme}
                                viewMode={viewMode}
                                maxWidth={maxWidth}
                                highlightConfig={highlightConfig}
                                onToggleView={toggleViewMode}
                                onStrikethrough={handleStrikethrough}
                                onStrikethroughPointerDown={handleStrikethroughPointerDown}
                                onExport={handleExport}
                                onClear={handleClearRequest}
                                onWidthChange={setMaxWidth}
                                onToggleHighlight={toggleHighlight}
                                soloMode={soloMode}
                                onSoloToggle={handleSoloToggle}
                                hasSeenSyntaxPanel={hasSeenSyntaxPanel}
                        />
                </div>
        );
};

export default App;
