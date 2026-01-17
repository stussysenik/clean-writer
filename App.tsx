import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
        THEMES,
        THEME_STORAGE_KEY,
        FONT_OPTIONS,
        FONT_STORAGE_KEY,
        FontId,
} from "./constants";
import { analyzeSyntax, countWords } from "./services/localSyntaxService";
import { SyntaxAnalysis, ViewMode, HighlightConfig } from "./types";
import Typewriter from "./components/Typewriter";
import MarkdownPreview from "./components/MarkdownPreview";
import ConfirmDialog from "./components/ConfirmDialog";
import Toolbar from "./components/Toolbar";
import ThemeSelector from "./components/Toolbar/ThemeSelector";
import ThemeCustomizer from "./components/ThemeCustomizer";
import UnifiedSyntaxPanel from "./components/UnifiedSyntaxPanel";
import TouchButton from "./components/TouchButton";
import { IconSettings } from "./components/Toolbar/Icons";
import useCustomTheme from "./hooks/useCustomTheme";
import useCustomPalettes, { SavedPalette } from "./hooks/useCustomPalettes";
import useThemeVisibility from "./hooks/useThemeVisibility";
import { getIconColor } from "./utils/contrastAwareColor";

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

        // Drag state for theme selector
        const [isDragging, setIsDragging] = useState(false);
        const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);

        // Drag handlers
        const handleDragStart = useCallback(() => {
                setIsDragging(true);
        }, []);

        const handleDragEnd = useCallback(() => {
                setIsDragging(false);
                setIsDraggingOverTrash(false);
        }, []);

        const handleDragOverTrash = useCallback((isOver: boolean) => {
                setIsDraggingOverTrash(isOver);
        }, []);

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

        // Syntax analysis
        useEffect(() => {
                const handler = setTimeout(async () => {
                        if (content.length > 0) {
                                const result = await analyzeSyntax(content);
                                updateSyntaxData(result);
                        }
                }, 500);

                return () => clearTimeout(handler);
        }, [content]);

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

        const handleStrikethrough = () => {
                const textarea = document.querySelector("textarea");
                if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        if (start === end) return;
                        const selectedText = content.substring(start, end);
                        const newContent =
                                content.substring(0, start) +
                                `~~${selectedText}~~` +
                                content.substring(end);
                        setContent(newContent);
                        setTimeout(() => textarea.focus(), 10);
                }
        };

        const toggleViewMode = () => {
                setViewMode(viewMode === "write" ? "preview" : "write");
        };

        // TrashZone component for dropping themes to hide/delete
        const TrashZone = () => {
                if (!isDragging) return null;

                const handleDragOver = (e: React.DragEvent) => {
                        e.preventDefault();
                        handleDragOverTrash(true);
                };

                const handleDragLeave = () => {
                        handleDragOverTrash(false);
                };

                const handleDrop = (e: React.DragEvent) => {
                        e.preventDefault();
                        handleDragOverTrash(false);
                };

                return (
                        <div
                                className="fixed top-0 left-0 right-0 h-32 flex items-center justify-center z-40 transition-all duration-200"
                                style={{
                                        background: isDraggingOverTrash
                                                ? `${currentTheme.accent}20`
                                                : "transparent",
                                        borderBottom: isDraggingOverTrash
                                                ? `2px solid ${currentTheme.accent}`
                                                : "1px dashed rgba(128,128,128,0.3)",
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                        >
                                <div
                                        className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-200"
                                        style={{
                                                backgroundColor:
                                                        isDraggingOverTrash
                                                                ? `${currentTheme.accent}30`
                                                                : `${currentTheme.text}10`,
                                                transform: isDraggingOverTrash
                                                        ? "scale(1.1)"
                                                        : "scale(1)",
                                                boxShadow: isDraggingOverTrash
                                                        ? `0 8px 32px ${currentTheme.accent}40`
                                                        : "none",
                                        }}
                                >
                                        <svg
                                                width="32"
                                                height="32"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={currentTheme.text}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{
                                                        color: isDraggingOverTrash
                                                                ? currentTheme.accent
                                                                : currentTheme.text,
                                                }}
                                        >
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                        <span
                                                className="text-sm font-medium"
                                                style={{
                                                        color: isDraggingOverTrash
                                                                ? currentTheme.accent
                                                                : currentTheme.text,
                                                }}
                                        >
                                                Drop to delete
                                        </span>
                                </div>
                        </div>
                );
        };

        return (
                <div
                        className="w-full h-[100dvh] flex flex-col relative overflow-hidden transition-colors duration-500"
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

                        {/* Trash Zone for deleting/hiding themes */}
                        <TrashZone />

                        {/* Top Bar with Theme Selector and Settings */}
                        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-30 pointer-events-none">
                                <div className="pointer-events-auto flex items-center min-h-[44px]">
                                        <ThemeSelector
                                                currentTheme={currentTheme}
                                                themeId={themeId}
                                                onThemeChange={
                                                        handleThemeChange
                                                }
                                                hiddenThemeIds={hiddenThemeIds}
                                                onHideTheme={hideTheme}
                                                customPalettes={visiblePalettes}
                                                activePaletteId={
                                                        activePaletteId
                                                }
                                                onPaletteSelect={
                                                        handlePaletteSelect
                                                }
                                                onDeletePalette={deletePalette}
                                                orderedThemes={orderedThemes}
                                                onReorderThemes={reorderThemes}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                isDraggingOverTrash={
                                                        isDraggingOverTrash
                                                }
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
                                                syntaxData={syntaxData}
                                                highlightConfig={
                                                        effectiveHighlightConfig
                                                }
                                                fontSize={fontSize}
                                                maxWidth={maxWidth}
                                                fontFamily={currentFont.family}
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
                        />

                        {/* Bottom Toolbar */}
                        <Toolbar
                                theme={currentTheme}
                                viewMode={viewMode}
                                maxWidth={maxWidth}
                                highlightConfig={highlightConfig}
                                onToggleView={toggleViewMode}
                                onStrikethrough={handleStrikethrough}
                                onExport={handleExport}
                                onClear={handleClearRequest}
                                onWidthChange={setMaxWidth}
                                onToggleHighlight={toggleHighlight}
                                soloMode={soloMode}
                                onSoloToggle={handleSoloToggle}
                        />
                </div>
        );
};

export default App;
