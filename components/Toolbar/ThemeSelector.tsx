import React, { useState, useRef, useCallback, useEffect } from "react";
import { RisoTheme } from "../../types";
import { THEMES } from "../../constants";
import Tooltip from "../Tooltip";
import { SavedPalette } from "../../hooks/useCustomPalettes";

interface ThemeSelectorProps {
        currentTheme: RisoTheme;
        themeId: string;
        onThemeChange: (id: string) => void;
        hiddenThemeIds?: string[];
        customPalettes?: SavedPalette[];
        activePaletteId?: string | null;
        onPaletteSelect?: (palette: SavedPalette) => void;
        orderedThemes?: typeof THEMES;
        onReorderThemes?: (fromIndex: number, toIndex: number) => void;
        onDragStart?: (
                themeInfo: { id: string; color: string; isPreset: boolean },
                position: { x: number; y: number }
        ) => void;
        onDragMove?: (position: { x: number; y: number }) => void;
        onDragEnd?: () => void;
        isDraggingOverTrash?: boolean;
}

// Long-press threshold in milliseconds
const LONG_PRESS_THRESHOLD = 400;

// Trash icon component
const TrashIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
        <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
        >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
        currentTheme,
        themeId,
        onThemeChange,
        hiddenThemeIds = [],
        customPalettes = [],
        activePaletteId = null,
        onPaletteSelect,
        orderedThemes = THEMES,
        onReorderThemes,
        onDragStart,
        onDragMove,
        onDragEnd,
        isDraggingOverTrash = false,
}) => {
        // Filter out hidden themes while preserving order
        const visibleThemes = orderedThemes.filter(
                (t) => !hiddenThemeIds.includes(t.id),
        );

        // Track which item type is being dragged
        const [dragItemType, setDragItemType] = useState<
                "preset" | "custom" | null
        >(null);
        const [pressedIndex, setPressedIndex] = useState<number | null>(null);

        // Drag state for reordering
        const [isDragMode, setIsDragMode] = useState(false);
        const [dragIndex, setDragIndex] = useState<number | null>(null);
        const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

        // Refs
        const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
        const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
        // Pointer capture refs
        const pointerIdRef = useRef<number | null>(null);
        const captureTargetRef = useRef<HTMLElement | null>(null);

        // Clear long-press timer
        const clearLongPressTimer = useCallback(() => {
                if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                }
        }, []);

        // Start long-press detection - immediately enters drag mode
        const handlePressStart = useCallback(
                (
                        index: number,
                        clientX: number,
                        clientY: number,
                        isPreset: boolean,
                        pointerId: number,
                        target: HTMLElement,
                ) => {
                        touchStartPosRef.current = { x: clientX, y: clientY };
                        setPressedIndex(index);
                        // Store pointer info for capture
                        pointerIdRef.current = pointerId;
                        captureTargetRef.current = target;

                        longPressTimerRef.current = setTimeout(() => {
                                // Trigger haptic feedback if available
                                if (navigator.vibrate) {
                                        navigator.vibrate(50);
                                }

                                // Capture pointer events to this element (works even outside container)
                                if (captureTargetRef.current && pointerIdRef.current !== null) {
                                        try {
                                                captureTargetRef.current.setPointerCapture(pointerIdRef.current);
                                        } catch (e) {
                                                // Pointer may have been released already
                                        }
                                }

                                // Immediately enter drag mode (no separate delete mode)
                                setIsDragMode(true);
                                setDragIndex(index);
                                setDragItemType(isPreset ? "preset" : "custom");

                                // Get theme/palette info for the dragged item
                                let themeInfo: { id: string; color: string; isPreset: boolean };
                                if (isPreset) {
                                        const theme = visibleThemes[index];
                                        themeInfo = {
                                                id: theme?.id || '',
                                                color: theme?.accent || '#888',
                                                isPreset: true,
                                        };
                                } else {
                                        const paletteIndex = index - visibleThemes.length;
                                        const palette = customPalettes[paletteIndex];
                                        const baseTheme = THEMES.find(t => t.id === palette?.baseThemeId);
                                        themeInfo = {
                                                id: palette?.id || '',
                                                color: palette?.overrides?.background || baseTheme?.accent || '#888',
                                                isPreset: false,
                                        };
                                }

                                // Signal to App.tsx with theme info and position
                                onDragStart?.(themeInfo, { x: clientX, y: clientY });
                        }, LONG_PRESS_THRESHOLD);
                },
                [onDragStart, visibleThemes, customPalettes],
        );

        // Handle press move
        const handlePressMove = useCallback(
                (clientX: number, clientY: number) => {
                        if (!touchStartPosRef.current) return;

                        const deltaX = Math.abs(
                                clientX - touchStartPosRef.current.x,
                        );
                        const deltaY = Math.abs(
                                clientY - touchStartPosRef.current.y,
                        );

                        // Cancel long-press if moved too much (before drag mode starts)
                        if (!isDragMode && (deltaX > 10 || deltaY > 10)) {
                                clearLongPressTimer();
                                setPressedIndex(null);
                        }

                        // Report position to parent for DragGhost
                        if (isDragMode) {
                                onDragMove?.({ x: clientX, y: clientY });
                        }

                        // Handle drag-over detection during drag mode
                        if (
                                isDragMode &&
                                dragIndex !== null &&
                                containerRef.current
                        ) {
                                const buttons = Array.from(
                                        buttonRefs.current.values(),
                                );
                                for (let i = 0; i < buttons.length; i++) {
                                        const btn = buttons[i];
                                        if (!btn) continue;
                                        const rect =
                                                btn.getBoundingClientRect();
                                        if (
                                                clientX >= rect.left &&
                                                clientX <= rect.right &&
                                                clientY >= rect.top &&
                                                clientY <= rect.bottom
                                        ) {
                                                if (i !== dragIndex) {
                                                        setDragOverIndex(i);
                                                }
                                                return;
                                        }
                                }
                                setDragOverIndex(null);
                        }
                },
                [isDragMode, dragIndex, clearLongPressTimer, onDragMove],
        );

        // Handle press end
        const handlePressEnd = useCallback(() => {
                clearLongPressTimer();
                touchStartPosRef.current = null;
                setPressedIndex(null);

                // Release pointer capture if active
                if (captureTargetRef.current && pointerIdRef.current !== null) {
                        try {
                                if (captureTargetRef.current.hasPointerCapture(pointerIdRef.current)) {
                                        captureTargetRef.current.releasePointerCapture(pointerIdRef.current);
                                }
                        } catch (e) {
                                // Pointer may have been released already
                        }
                }
                pointerIdRef.current = null;
                captureTargetRef.current = null;

                // Complete the reorder if in drag mode and dropped on another theme (not on trash)
                if (
                        isDragMode &&
                        dragIndex !== null &&
                        dragOverIndex !== null &&
                        !isDraggingOverTrash &&
                        onReorderThemes &&
                        dragItemType === "preset"
                ) {
                        const fromThemeId = visibleThemes[dragIndex]?.id;
                        const toThemeId = visibleThemes[dragOverIndex]?.id;

                        if (fromThemeId && toThemeId) {
                                const fullFromIndex = orderedThemes.findIndex(
                                        (t) => t.id === fromThemeId,
                                );
                                const fullToIndex = orderedThemes.findIndex(
                                        (t) => t.id === toThemeId,
                                );

                                if (
                                        fullFromIndex !== -1 &&
                                        fullToIndex !== -1
                                ) {
                                        onReorderThemes(
                                                fullFromIndex,
                                                fullToIndex,
                                        );
                                }
                        }
                }

                // Signal drag end to parent (App.tsx handles delete animation)
                if (isDragMode) {
                        onDragEnd?.();
                }

                // Reset drag state
                setIsDragMode(false);
                setDragIndex(null);
                setDragOverIndex(null);
                setDragItemType(null);
        }, [
                isDragMode,
                dragIndex,
                dragOverIndex,
                isDraggingOverTrash,
                dragItemType,
                onReorderThemes,
                visibleThemes,
                orderedThemes,
                onDragEnd,
                clearLongPressTimer,
        ]);

        // Pointer events (unified mouse + touch handling with pointer capture)
        const handlePointerDown = useCallback(
                (index: number, e: React.PointerEvent, isPreset: boolean) => {
                        // Prevent default to avoid text selection during drag
                        e.preventDefault();
                        handlePressStart(
                                index,
                                e.clientX,
                                e.clientY,
                                isPreset,
                                e.pointerId,
                                e.currentTarget as HTMLElement,
                        );
                },
                [handlePressStart],
        );

        const handlePointerMove = useCallback(
                (e: React.PointerEvent) => {
                        handlePressMove(e.clientX, e.clientY);
                },
                [handlePressMove],
        );

        const handlePointerUp = useCallback(() => {
                handlePressEnd();
        }, [handlePressEnd]);

        // Cleanup timers on unmount
        useEffect(() => {
                return () => {
                        clearLongPressTimer();
                };
        }, [clearLongPressTimer]);

        // Handle theme click
        const handleThemeClick = useCallback(
                (id: string, index: number) => {
                        if (isDragMode) return;

                        onThemeChange(id);
                },
                [isDragMode, onThemeChange],
        );

        // Handle custom palette click
        const handlePaletteClick = useCallback(
                (palette: SavedPalette) => {
                        if (isDragMode) return;

                        onPaletteSelect?.(palette);
                },
                [isDragMode, onPaletteSelect],
        );

        return (
                <div
                        ref={containerRef}
                        className="flex gap-3 flex-wrap max-w-[240px] md:max-w-[320px] items-center"
                        onPointerMove={isDragMode ? handlePointerMove : undefined}
                >
                        {/* Preset Themes */}
                        {visibleThemes.map((t, index) => {
                                const isBeingDragged =
                                        isDragMode && dragIndex === index;
                                const isDragTarget =
                                        isDragMode &&
                                        dragOverIndex === index &&
                                        dragIndex !== index;
                                const isSelected =
                                        themeId === t.id && !activePaletteId;
                                const isPressed = pressedIndex === index;
                                const canDelete = visibleThemes.length > 1;

                                return (
                                        <div key={t.id} className="relative">
                                                <Tooltip
                                                        content={t.name}
                                                        position="bottom"
                                                        disabled={isDragMode}
                                                >
                                                        <button
                                                                ref={(el) => {
                                                                        if (el)
                                                                                buttonRefs.current.set(
                                                                                        index,
                                                                                        el,
                                                                                );
                                                                        else
                                                                                buttonRefs.current.delete(
                                                                                        index,
                                                                                );
                                                                }}
                                                                onClick={() =>
                                                                        handleThemeClick(
                                                                                t.id,
                                                                                index,
                                                                        )
                                                                }
                                                                onPointerDown={(e) =>
                                                                        handlePointerDown(
                                                                                index,
                                                                                e,
                                                                                true,
                                                                        )
                                                                }
                                                                onPointerUp={handlePointerUp}
                                                                onPointerMove={isDragMode ? handlePointerMove : undefined}
                                                                onPointerCancel={handlePointerUp}
                                                                className={`relative w-9 h-9 md:w-8 md:h-8 rounded-full transition-all duration-200 touch-manipulation overflow-hidden ${
                                                                        isSelected
                                                                                ? "ring-2 ring-offset-2"
                                                                                : "hover:scale-110 opacity-80 hover:opacity-100"
                                                                } ${isBeingDragged ? "z-50" : ""}`}
                                                                style={
                                                                        {
                                                                                backgroundColor:
                                                                                        t.accent,
                                                                                "--tw-ring-color":
                                                                                        currentTheme.text,
                                                                                "--tw-ring-offset-color":
                                                                                        currentTheme.background,
                                                                                transform: isBeingDragged
                                                                                        ? "scale(1.3)"
                                                                                        : isDragTarget
                                                                                          ? "scale(1.15)"
                                                                                          : isPressed
                                                                                            ? "scale(0.95)"
                                                                                            : isSelected
                                                                                              ? "scale(1.1)"
                                                                                              : undefined,
                                                                                boxShadow: isBeingDragged
                                                                                        ? "0 8px 24px rgba(0,0,0,0.35)"
                                                                                        : isSelected
                                                                                          ? "0 2px 8px rgba(0,0,0,0.2)"
                                                                                          : undefined,
                                                                                transition: isDragMode
                                                                                        ? "transform 150ms ease, box-shadow 150ms ease"
                                                                                        : "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                                                                        } as React.CSSProperties
                                                                }
                                                                title={t.name}
                                                        ></button>
                                                </Tooltip>
                                        </div>
                                );
                        })}

                        {/* Visual Separator if there are custom palettes */}
                        {customPalettes.length > 0 && (
                                <div
                                        className="w-px h-7 mx-1 opacity-30"
                                        style={{
                                                backgroundColor:
                                                        currentTheme.text,
                                        }}
                                />
                        )}

                        {/* Custom Palettes */}
                        {customPalettes.map((palette, index) => {
                                const isSelected =
                                        activePaletteId === palette.id;
                                const paletteIndex =
                                        visibleThemes.length + index;

                                return (
                                        <div
                                                key={palette.id}
                                                className="relative"
                                        >
                                                <Tooltip
                                                        content={palette.name}
                                                        position="bottom"
                                                        disabled={isDragMode}
                                                >
                                                        <button
                                                                onClick={() =>
                                                                        handlePaletteClick(
                                                                                palette,
                                                                        )
                                                                }
                                                                onPointerDown={(e) =>
                                                                        handlePointerDown(
                                                                                paletteIndex,
                                                                                e,
                                                                                false,
                                                                        )
                                                                }
                                                                onPointerUp={handlePointerUp}
                                                                onPointerMove={isDragMode ? handlePointerMove : undefined}
                                                                onPointerCancel={handlePointerUp}
                                                                className={`relative w-9 h-9 md:w-8 md:h-8 rounded-full transition-all duration-200 touch-manipulation border-2 border-dashed overflow-hidden ${
                                                                        isSelected
                                                                                ? "ring-2 ring-offset-2"
                                                                                : "hover:scale-110 opacity-80 hover:opacity-100"
                                                                }`}
                                                                style={
                                                                        {
                                                                                backgroundColor:
                                                                                        palette
                                                                                                .overrides
                                                                                                .background ||
                                                                                        THEMES.find(
                                                                                                (
                                                                                                        t,
                                                                                                ) =>
                                                                                                        t.id ===
                                                                                                        palette.baseThemeId,
                                                                                        )
                                                                                                ?.accent ||
                                                                                        "#888",
                                                                                borderColor: `${currentTheme.text}50`,
                                                                                "--tw-ring-color":
                                                                                        currentTheme.text,
                                                                                "--tw-ring-offset-color":
                                                                                        currentTheme.background,
                                                                                transform: isSelected
                                                                                        ? "scale(1.1)"
                                                                                        : undefined,
                                                                                transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                                                                        } as React.CSSProperties
                                                                }
                                                                title={
                                                                        palette.name
                                                                }
                                                        ></button>
                                                </Tooltip>
                                        </div>
                                );
                        })}
                </div>
        );
};

export default ThemeSelector;
