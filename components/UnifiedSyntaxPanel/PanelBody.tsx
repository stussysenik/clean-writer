import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../../types';
import { getWordTypeCounts } from '../../services/localSyntaxService';
import TouchButton from '../TouchButton';

interface PanelBodyProps {
  theme: RisoTheme;
  wordCount: number;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode: keyof HighlightConfig | null;
  onSoloToggle: (key: keyof HighlightConfig | null) => void;
  isOpen?: boolean;
  onCategoryHover?: (category: keyof HighlightConfig | null) => void;
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

const ITEM_HEIGHT = 44;
const LONG_PRESS_MS = 400;
const ORDER_STORAGE_KEY = 'clean_writer_word_type_order';
const BREAKDOWN_COLLAPSED_KEY = 'clean_writer_breakdown_collapsed';

const PanelBody: React.FC<PanelBodyProps> = ({
  theme,
  wordCount,
  syntaxData,
  highlightConfig,
  onToggleHighlight,
  soloMode,
  onSoloToggle,
  isOpen = false,
  onCategoryHover,
}) => {
  const wordTypeCounts = getWordTypeCounts(syntaxData);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  // Check for reduced motion preference
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Elastic dot entrance animation using GSAP
  useEffect(() => {
    if (isOpen && !hasAnimated.current && !reducedMotion) {
      hasAnimated.current = true;
      const dots = dotsRef.current.filter(Boolean);

      // Reset dots to starting position
      gsap.set(dots, { scale: 0, opacity: 0 });

      // Animate dots with elastic spring and stagger
      gsap.to(dots, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
        stagger: 0.05,
        delay: 0.1,
      });
    } else if (!isOpen) {
      // Reset for next open
      hasAnimated.current = false;
    }
  }, [isOpen, reducedMotion]);

  // Breakdown collapsed state
  const [isBreakdownCollapsed, setIsBreakdownCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(BREAKDOWN_COLLAPSED_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(BREAKDOWN_COLLAPSED_KEY, String(isBreakdownCollapsed));
    } catch {}
  }, [isBreakdownCollapsed]);

  // Toggle breakdown
  const toggleBreakdown = useCallback(() => {
    setIsBreakdownCollapsed(prev => !prev);
  }, []);

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

  // Item drag handlers
  const handleItemDragStart = useCallback((key: WordTypeKey, clientY: number) => {
    setDraggedItem(key);
    dragStartYRef.current = clientY;
    setDragOffset(0);

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

    const currentIndex = wordTypeOrder.indexOf(draggedItem);
    const newPosition = currentIndex * ITEM_HEIGHT + offset;
    const newIndex = Math.max(0, Math.min(wordTypeOrder.length - 1, Math.round(newPosition / ITEM_HEIGHT)));

    if (newIndex !== currentIndex) {
      const newOrder = [...wordTypeOrder];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, draggedItem);
      setWordTypeOrder(newOrder);
      dragStartYRef.current = clientY - (newIndex * ITEM_HEIGHT - currentIndex * ITEM_HEIGHT) + (offset - (newIndex - currentIndex) * ITEM_HEIGHT);
    }

    // Update positions with collision effect
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

        const collisionRadius = ITEM_HEIGHT * 1.5;
        if (absDistance < collisionRadius) {
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

    const positions: Record<WordTypeKey, number> = {} as Record<WordTypeKey, number>;
    wordTypeOrder.forEach((k, index) => {
      positions[k] = index * ITEM_HEIGHT;
    });
    setItemPositions(positions);
  }, [wordTypeOrder]);

  const handleDoubleClick = useCallback((key: keyof HighlightConfig) => {
    if (soloMode === key) {
      onSoloToggle(null);
    } else {
      onSoloToggle(key);
    }
  }, [onSoloToggle, soloMode]);

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
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (Math.abs(clientY - dragStartYRef.current) > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [draggedItem, handleItemDragMove]);

  // Global listeners for item drag
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

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="font-mono text-sm"
      style={{
        color: theme.text,
        width: 'min(320px, calc(100vw - 84px))',
        minWidth: '260px',
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

      {/* Word Type Breakdown */}
      <div className="px-6 pb-4">
        {/* Collapsible header with toggle */}
        <button
          onClick={toggleBreakdown}
          className="w-full text-[10px] uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2 cursor-pointer hover:opacity-60 transition-opacity focus:outline-none"
        >
          <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
          <span className="flex items-center gap-1.5">
            <span
              className="transition-transform duration-200"
              style={{
                display: 'inline-block',
                transform: isBreakdownCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
            <span>Breakdown</span>
          </span>
          <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
        </button>

        {/* Collapsible content with max-height animation */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: isBreakdownCollapsed ? '0px' : `${orderedConfig.length * ITEM_HEIGHT + 20}px`,
            opacity: isBreakdownCollapsed ? 0 : 1,
          }}
        >
          {/* Draggable items container */}
          <div className="relative" style={{ height: orderedConfig.length * ITEM_HEIGHT }}>
          {orderedConfig.map((item, index) => {
            const isBeingDragged = draggedItem === item.key;
            const basePosition = index * ITEM_HEIGHT;
            const currentPosition = itemPositions[item.key] ?? basePosition;
            const isActive = highlightConfig[item.key as keyof HighlightConfig];
            const isSoloed = soloMode === item.key;
            const isDimmed = soloMode !== null && !isSoloed;

            const displacement = currentPosition - basePosition;
            const isBeingPushed = !isBeingDragged && draggedItem && Math.abs(displacement) > 2;
            const pushIntensity = Math.min(1, Math.abs(displacement) / 20);

            return (
              <div
                key={item.key}
                className={`absolute left-0 right-0 flex items-center justify-between py-2 px-2 -mx-2 rounded-lg select-none ${
                  isBeingDragged ? 'z-50 cursor-grabbing' : 'z-10 cursor-grab'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                  transform: `translateY(${currentPosition}px) scale(${
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
                onMouseEnter={() => onCategoryHover?.(item.key as keyof HighlightConfig)}
                onMouseLeave={() => onCategoryHover?.(null)}
              >
                <div className="flex items-center gap-3">
                  <span
                    ref={(el) => { dotsRef.current[index] = el; }}
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
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold tabular-nums">{item.count}</span>
                    <span className="text-xs opacity-40">x</span>
                  </div>

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
          to toggle
        </p>
      </div>
    </div>
  );
};

export default PanelBody;
