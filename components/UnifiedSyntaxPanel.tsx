import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../types';
import { countWords, getWordTypeCounts } from '../services/localSyntaxService';
import TouchButton from './TouchButton';

interface UnifiedSyntaxPanelProps {
  content: string;
  theme: RisoTheme;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode?: keyof HighlightConfig | null;
  onSoloToggle?: (key: keyof HighlightConfig | null) => void;
  // First-visit hint props
  hasSeenPanel?: boolean;
  onPanelSeen?: () => void;
}

const DEFAULT_WORD_TYPE_CONFIG = [
  { key: 'nouns', label: 'Nouns', shortKey: '1', colorKey: 'noun' },
  { key: 'verbs', label: 'Verbs', shortKey: '2', colorKey: 'verb' },
  { key: 'adjectives', label: 'Adjectives', shortKey: '3', colorKey: 'adjective' },
  { key: 'adverbs', label: 'Adverbs', shortKey: '4', colorKey: 'adverb' },
  { key: 'pronouns', label: 'Pronouns', shortKey: '5', colorKey: 'pronoun' },
  { key: 'prepositions', label: 'Prepositions', shortKey: '6', colorKey: 'preposition' },
  { key: 'conjunctions', label: 'Conjunctions', shortKey: '7', colorKey: 'conjunction' },
  { key: 'articles', label: 'Articles', shortKey: '8', colorKey: 'article' },
  { key: 'interjections', label: 'Interjections', shortKey: '9', colorKey: 'interjection' },
] as const;

type WordTypeKey = typeof DEFAULT_WORD_TYPE_CONFIG[number]['key'];

// Constants for click/drag detection
const CLICK_THRESHOLD_MS = 200;
const DRAG_THRESHOLD_PX = 5;
const LONG_PRESS_MS = 400;
const ITEM_HEIGHT = 44;

// Storage key for word type order
const ORDER_STORAGE_KEY = 'clean_writer_word_type_order';

const UnifiedSyntaxPanel: React.FC<UnifiedSyntaxPanelProps> = ({
  content,
  theme,
  syntaxData,
  highlightConfig,
  onToggleHighlight,
  soloMode,
  onSoloToggle,
  hasSeenPanel = true,
  onPanelSeen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startTranslateRef = useRef(0);

  // Refs for click/drag separation
  const pressStartTimeRef = useRef<number>(0);
  const pressStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Reorder state
  const [wordTypeOrder, setWordTypeOrder] = useState<WordTypeKey[]>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_WORD_TYPE_CONFIG.length) {
          return parsed as WordTypeKey[];
        }
      }
    } catch {}
    return DEFAULT_WORD_TYPE_CONFIG.map(c => c.key);
  });

  const [draggedItem, setDraggedItem] = useState<WordTypeKey | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [itemPositions, setItemPositions] = useState<Record<WordTypeKey, number>>({} as Record<WordTypeKey, number>);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartYRef = useRef(0);
  const itemRefsMap = useRef<Record<string, HTMLDivElement | null>>({});

  const wordCount = countWords(content);
  const wordTypeCounts = getWordTypeCounts(syntaxData);

  // Get ordered word type config
  const orderedConfig = useMemo(() => {
    return wordTypeOrder.map(key => {
      const config = DEFAULT_WORD_TYPE_CONFIG.find(c => c.key === key)!;
      return {
        ...config,
        count: wordTypeCounts[key] || 0,
      };
    });
  }, [wordTypeOrder, wordTypeCounts]);

  // Persist order
  useEffect(() => {
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(wordTypeOrder));
    } catch {}
  }, [wordTypeOrder]);

  // Initialize item positions
  useEffect(() => {
    const positions: Record<WordTypeKey, number> = {} as Record<WordTypeKey, number>;
    wordTypeOrder.forEach((key, index) => {
      positions[key] = index * ITEM_HEIGHT;
    });
    setItemPositions(positions);
  }, [wordTypeOrder]);

  // Handle touch/mouse drag start for panel
  const handleDragStart = useCallback((clientX: number) => {
    pressStartTimeRef.current = Date.now();
    pressStartPosRef.current = { x: clientX, y: 0 };
    hasDraggedRef.current = false;
    startXRef.current = clientX;
    startTranslateRef.current = isOpen ? 0 : 320;
    setIsPressing(true);
  }, [isOpen]);

  // Handle touch/mouse drag move for panel
  const handleDragMove = useCallback((clientX: number) => {
    if (!panelRef.current) return;

    const deltaFromStart = Math.abs(clientX - pressStartPosRef.current.x);

    if (deltaFromStart > DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      const delta = startXRef.current - clientX;
      const newTranslate = Math.max(0, Math.min(320, startTranslateRef.current + delta));
      panelRef.current.style.transform = `translateX(${320 - newTranslate}px)`;
    }
  }, []);

  // Handle touch/mouse drag end for panel
  const handleDragEnd = useCallback((clientX: number) => {
    const pressDuration = Date.now() - pressStartTimeRef.current;
    const wasClick = pressDuration < CLICK_THRESHOLD_MS && !hasDraggedRef.current;

    if (wasClick) {
      setIsOpen(prev => !prev);
    } else if (isDragging && panelRef.current) {
      const delta = startXRef.current - clientX;
      if (isOpen && delta < -60) {
        setIsOpen(false);
      } else if (!isOpen && delta > 60) {
        setIsOpen(true);
      }
      panelRef.current.style.transform = '';
    }

    setIsDragging(false);
    setIsPressing(false);
    hasDraggedRef.current = false;
  }, [isDragging, isOpen]);

  // Touch events for panel
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleDragEnd(e.changedTouches[0].clientX);
  };

  // Mouse events for panel
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  useEffect(() => {
    if (!isPressing) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      handleDragEnd(e.clientX);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPressing, handleDragMove, handleDragEnd]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark panel as seen when opened for the first time
  useEffect(() => {
    if (isOpen && !hasSeenPanel && onPanelSeen) {
      onPanelSeen();
    }
  }, [isOpen, hasSeenPanel, onPanelSeen]);

  // ===== ITEM REORDER DRAG HANDLING =====

  const handleItemDragStart = useCallback((key: WordTypeKey, clientY: number) => {
    setDraggedItem(key);
    dragStartYRef.current = clientY;
    setDragOffset(0);

    // Initialize positions based on current order
    const positions: Record<WordTypeKey, number> = {} as Record<WordTypeKey, number>;
    wordTypeOrder.forEach((k, index) => {
      positions[k] = index * ITEM_HEIGHT;
    });
    setItemPositions(positions);
  }, [wordTypeOrder]);

  const handleItemDragMove = useCallback((clientY: number) => {
    if (!draggedItem) return;

    const offset = clientY - dragStartYRef.current;
    setDragOffset(offset);

    // Calculate new index based on drag position
    const currentIndex = wordTypeOrder.indexOf(draggedItem);
    const newPosition = currentIndex * ITEM_HEIGHT + offset;
    const newIndex = Math.max(0, Math.min(wordTypeOrder.length - 1, Math.round(newPosition / ITEM_HEIGHT)));

    if (newIndex !== currentIndex) {
      // Update order
      const newOrder = [...wordTypeOrder];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, draggedItem);
      setWordTypeOrder(newOrder);

      // Reset drag start to prevent jumping
      dragStartYRef.current = clientY - (newIndex * ITEM_HEIGHT - currentIndex * ITEM_HEIGHT) + (offset - (newIndex - currentIndex) * ITEM_HEIGHT);
    }

    // Update positions for collision effect - items "push away" from dragged item
    const positions: Record<WordTypeKey, number> = {} as Record<WordTypeKey, number>;
    const draggedIndex = wordTypeOrder.indexOf(draggedItem);
    const draggedPosition = draggedIndex * ITEM_HEIGHT + offset;

    wordTypeOrder.forEach((k, index) => {
      if (k === draggedItem) {
        positions[k] = draggedPosition;
      } else {
        const itemBasePosition = index * ITEM_HEIGHT;
        const itemCenter = itemBasePosition + ITEM_HEIGHT / 2;
        const draggedCenter = draggedPosition + ITEM_HEIGHT / 2;
        const distanceFromDragged = itemCenter - draggedCenter;
        const absDistance = Math.abs(distanceFromDragged);

        // Collision zone - items within ~60px get pushed away
        const collisionRadius = ITEM_HEIGHT * 1.5;
        if (absDistance < collisionRadius) {
          // Calculate push force - stronger when closer
          const pushStrength = (1 - absDistance / collisionRadius) * 20;
          const pushDirection = distanceFromDragged > 0 ? 1 : -1;
          positions[k] = itemBasePosition + pushDirection * pushStrength;
        } else {
          positions[k] = itemBasePosition;
        }
      }
    });
    setItemPositions(positions);
  }, [draggedItem, wordTypeOrder]);

  const handleItemDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOffset(0);

    // Reset positions with animation
    const positions: Record<WordTypeKey, number> = {} as Record<WordTypeKey, number>;
    wordTypeOrder.forEach((k, index) => {
      positions[k] = index * ITEM_HEIGHT;
    });
    setItemPositions(positions);
  }, [wordTypeOrder]);

  // Double-click handler for solo mode toggle
  const handleDoubleClick = useCallback((key: keyof HighlightConfig) => {
    if (onSoloToggle) {
      if (soloMode === key) {
        onSoloToggle(null); // Exit solo mode
      } else {
        onSoloToggle(key); // Enter solo mode for this category
      }
    }
  }, [onSoloToggle, soloMode]);

  // Long press for item reorder
  const handleItemMouseDown = useCallback((key: WordTypeKey, e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTimerRef.current = setTimeout(() => {
      handleItemDragStart(key, clientY);
    }, LONG_PRESS_MS);
  }, [handleItemDragStart]);

  const handleItemMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (draggedItem) {
      handleItemDragEnd();
    }
  }, [draggedItem, handleItemDragEnd]);

  const handleItemMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggedItem) {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      handleItemDragMove(clientY);
    } else if (longPressTimerRef.current) {
      // Cancel long press if moved too much
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (Math.abs(clientY - dragStartYRef.current) > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [draggedItem, handleItemDragMove]);

  // Global mouse/touch move and up for item drag
  useEffect(() => {
    if (!draggedItem) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      handleItemDragMove(clientY);
    };

    const handleUp = () => {
      handleItemDragEnd();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [draggedItem, handleItemDragMove, handleItemDragEnd]);

  // Cleanup long press timer
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Don't render if no content
  if (wordCount === 0) return null;

  return (
    <div
      ref={panelRef}
      data-testid="syntax-panel"
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex ${
        isDragging ? '' : 'transition-transform duration-300'
      }`}
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(320px)',
        transitionTimingFunction: isOpen
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Compact Tab - Shows word count */}
      <div
        data-testid="syntax-panel-tab"
        className="flex-shrink-0 cursor-pointer select-none touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`rounded-l-2xl shadow-lg flex items-center gap-2 transition-all duration-300 ${
            !hasSeenPanel && !isOpen ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            padding: isOpen ? '12px 8px' : '14px 16px',
          }}
        >
          {/* Closed state - Compact word count like first image */}
          {!isOpen && (
            <>
              <span
                className="text-3xl font-bold tracking-tight tabular-nums"
                style={{ color: theme.text }}
              >
                {wordCount}
              </span>
              <span className="text-xs uppercase tracking-widest opacity-50 font-medium">
                words
              </span>
              <span className="text-xs opacity-30 ml-1">◀</span>
            </>
          )}

          {/* Open state - Drag handle */}
          {isOpen && (
            <div className="flex flex-col gap-1 opacity-40 py-2">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: theme.text }} />
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: theme.text }} />
            </div>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div
        className="w-[320px] shadow-2xl overflow-hidden font-mono text-sm rounded-l-2xl"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transformOrigin: 'right center',
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Word Count Header */}
        <div className="w-full px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-bold tracking-tighter tabular-nums"
              style={{ color: theme.text }}
            >
              {wordCount}
            </span>
            <span className="text-sm uppercase tracking-widest opacity-50 font-medium">
              words
            </span>
          </div>
        </div>

        {/* Word Type Breakdown - with drag reorder */}
        <div className="px-6 pb-4">
          <div className="text-[10px] uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
            <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
            <span>Breakdown</span>
            <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
          </div>

          {/* Draggable items container */}
          <div
            className="relative"
            style={{ height: orderedConfig.length * ITEM_HEIGHT }}
          >
            {orderedConfig.map((item, index) => {
              const isBeingDragged = draggedItem === item.key;
              const basePosition = index * ITEM_HEIGHT;
              const currentPosition = itemPositions[item.key] ?? basePosition;
              const isActive = highlightConfig[item.key as keyof HighlightConfig];
              const isSoloed = soloMode === item.key;
              const isDimmed = soloMode !== null && !isSoloed;

              // Calculate collision effects for non-dragged items
              const displacement = currentPosition - basePosition;
              const isBeingPushed = !isBeingDragged && draggedItem && Math.abs(displacement) > 2;
              const pushIntensity = Math.min(1, Math.abs(displacement) / 20);

              return (
                <div
                  key={item.key}
                  ref={el => { itemRefsMap.current[item.key] = el; }}
                  className={`absolute left-0 right-0 flex items-center justify-between py-2 px-2 -mx-2 rounded-lg select-none ${
                    isBeingDragged ? 'z-50 cursor-grabbing' : 'z-10 cursor-grab'
                  }`}
                  style={{
                    height: ITEM_HEIGHT,
                    transform: `translateY(${isBeingDragged ? currentPosition : currentPosition}px) scale(${
                      isBeingDragged ? 1.05 : isBeingPushed ? 1 - pushIntensity * 0.03 : 1
                    }) rotate(${isBeingPushed ? displacement * 0.1 : 0}deg)`,
                    transition: isBeingDragged
                      ? 'box-shadow 150ms ease, scale 150ms ease'
                      : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease, scale 200ms ease',
                    backgroundColor: isBeingDragged ? theme.background : isBeingPushed ? `${theme.text}05` : 'transparent',
                    boxShadow: isBeingDragged
                      ? '0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)'
                      : isBeingPushed
                      ? '0 2px 8px rgba(0,0,0,0.08)'
                      : 'none',
                    opacity: isDimmed ? 0.4 : !isActive ? 0.4 : 1,
                    filter: isDimmed ? 'grayscale(0.6)' : 'none',
                    borderRadius: '8px',
                  }}
                  onDoubleClick={() => handleDoubleClick(item.key as keyof HighlightConfig)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleItemMouseDown(item.key, e);
                  }}
                  onTouchStart={(e) => {
                    handleItemMouseDown(item.key, e);
                  }}
                  onMouseMove={handleItemMouseMove}
                  onTouchMove={handleItemMouseMove}
                  onMouseUp={handleItemMouseUp}
                  onTouchEnd={handleItemMouseUp}
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot with collision animation */}
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: theme.highlight[item.colorKey as keyof typeof theme.highlight],
                        transform: isBeingDragged
                          ? 'scale(1.4)'
                          : isBeingPushed
                          ? `scale(${1.1 + pushIntensity * 0.15})`
                          : 'scale(1)',
                        boxShadow: isBeingDragged
                          ? `0 0 16px ${theme.highlight[item.colorKey as keyof typeof theme.highlight]}90, 0 0 32px ${theme.highlight[item.colorKey as keyof typeof theme.highlight]}40`
                          : isBeingPushed
                          ? `0 0 8px ${theme.highlight[item.colorKey as keyof typeof theme.highlight]}50`
                          : 'none',
                        transition: 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 150ms ease',
                      }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Count */}
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold tabular-nums">{item.count}</span>
                      <span className="text-xs opacity-40">x</span>
                    </div>

                    {/* Toggle button */}
                    <TouchButton
                      onClick={() => onToggleHighlight(item.key as keyof HighlightConfig)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isSoloed ? 'ring-2 ring-offset-1' : ''
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? `${theme.highlight[item.colorKey as keyof typeof theme.highlight]}30`
                          : `${theme.text}10`,
                        color: isActive
                          ? theme.highlight[item.colorKey as keyof typeof theme.highlight]
                          : theme.text,
                        '--tw-ring-color': theme.highlight[item.colorKey as keyof typeof theme.highlight],
                        '--tw-ring-offset-color': theme.background,
                        minWidth: '32px',
                        minHeight: '32px',
                      } as React.CSSProperties}
                    >
                      {item.shortKey}
                    </TouchButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keyboard Hint Footer */}
        <div
          className="px-6 py-3 text-center border-t"
          style={{ borderColor: `${theme.text}10` }}
        >
          <p className="text-xs opacity-40">
            Press{' '}
            <kbd
              className="px-1.5 py-0.5 rounded border text-[10px] font-bold mx-0.5"
              style={{ borderColor: `${theme.text}20` }}
            >
              1
            </kbd>
            -
            <kbd
              className="px-1.5 py-0.5 rounded border text-[10px] font-bold mx-0.5"
              style={{ borderColor: `${theme.text}20` }}
            >
              9
            </kbd>{' '}
            to toggle • Long press to reorder
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSyntaxPanel;
