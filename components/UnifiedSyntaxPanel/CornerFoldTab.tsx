import React from 'react';
import { RisoTheme } from '../../types';
import { HarmonicaStage } from '../../hooks/useHarmonicaDrag';

interface CornerFoldTabProps {
  theme: RisoTheme;
  wordCount: number;
  isOpen: boolean;
  hasSeenPanel: boolean;
  onClick: () => void;
  // Harmonica mode props (optional for backwards compatibility)
  harmonicaMode?: boolean;
  stage?: HarmonicaStage;
  dragProgress?: number;
  onDragStart?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragMove?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd?: () => void;
}

// Directional arrow affordance component
const DirectionArrow: React.FC<{
  direction: 'left' | 'up' | 'right';
  theme: RisoTheme;
  animate?: boolean;
}> = ({ direction, theme, animate = false }) => {
  const arrows: Record<string, string> = {
    left: '‹',
    up: '⌃',
    right: '›',
  };

  const transforms: Record<string, string> = {
    left: 'translateX(-2px)',
    up: 'translateY(-2px)',
    right: 'translateX(2px)',
  };

  return (
    <span
      className={`absolute text-sm font-bold transition-all duration-300 ${animate ? 'animate-pulse' : ''}`}
      style={{
        color: theme.text,
        opacity: 0.3,
        ...(direction === 'left' && { left: '4px', top: '50%', transform: 'translateY(-50%)' }),
        ...(direction === 'up' && { top: '4px', left: '50%', transform: 'translateX(-50%)' }),
        ...(direction === 'right' && { right: '4px', top: '50%', transform: 'translateY(-50%)' }),
        animation: animate ? `gentleBounce-${direction} 1.5s ease-in-out infinite` : undefined,
      }}
    >
      <style>{`
        @keyframes gentleBounce-left {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) ${transforms.left}; }
        }
        @keyframes gentleBounce-up {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) ${transforms.up}; }
        }
        @keyframes gentleBounce-right {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) ${transforms.right}; }
        }
      `}</style>
      {arrows[direction]}
    </span>
  );
};

const CornerFoldTab: React.FC<CornerFoldTabProps> = ({
  theme,
  wordCount,
  isOpen,
  hasSeenPanel,
  onClick,
  harmonicaMode = false,
  stage = 'closed',
  dragProgress = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const showPulse = !hasSeenPanel && !isOpen && stage === 'closed';

  // Determine arrow direction based on current stage
  const getArrowDirection = (): 'left' | 'up' | 'right' | null => {
    if (!harmonicaMode) return null;
    switch (stage) {
      case 'closed': return 'left';
      case 'peek': return 'up';
      case 'expand': return 'left';
      case 'full': return 'right'; // Collapse hint
      default: return null;
    }
  };

  const arrowDirection = getArrowDirection();

  // In harmonica mode, we use drag instead of click
  const handleClick = harmonicaMode ? undefined : onClick;

  return (
    <button
      onClick={handleClick}
      data-testid="mobile-fold-tab"
      className={`
        relative cursor-pointer select-none touch-manipulation
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${showPulse ? 'animate-pulse' : ''}
      `}
      style={{
        // Size of the corner tab
        width: harmonicaMode ? '56px' : (isOpen ? '36px' : '56px'),
        height: '80px',
        // Move tab left when panel opens (so it stays attached to panel edge)
        marginRight: harmonicaMode ? '0' : (isOpen ? '-2px' : '0'),
        // Align tab to bottom when panel is anchored at bottom
        alignSelf: 'flex-end',
        marginBottom: '8px',
        ['--tw-ring-color' as string]: theme.text,
        ['--tw-ring-offset-color' as string]: theme.background,
        // Touch action for harmonica drag mode
        touchAction: harmonicaMode ? 'none' : undefined,
        // Visual feedback during drag
        transform: harmonicaMode && dragProgress > 0 && dragProgress < 0.5
          ? `scale(${1 - dragProgress * 0.05})`
          : 'scale(1)',
      }}
      aria-label={isOpen || stage !== 'closed' ? 'Close syntax panel' : `Open syntax panel (${wordCount} words)`}
      aria-expanded={isOpen || stage !== 'closed'}
      // Harmonica drag handlers
      onTouchStart={harmonicaMode ? onDragStart : undefined}
      onTouchMove={harmonicaMode ? onDragMove : undefined}
      onTouchEnd={harmonicaMode ? onDragEnd : undefined}
      onMouseDown={harmonicaMode ? onDragStart : undefined}
      onMouseMove={harmonicaMode ? onDragMove : undefined}
      onMouseUp={harmonicaMode ? onDragEnd : undefined}
    >
      {/* Tab background with paper-fold effect */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `linear-gradient(${isOpen ? '90deg' : '135deg'},
            ${theme.background} 0%,
            ${theme.text}08 50%,
            ${theme.text}12 100%)`,
          borderRadius: isOpen ? '8px 0 0 8px' : '0',
          clipPath: isOpen
            ? 'none'
            : 'polygon(100% 0, 100% 100%, 0 100%, 40% 50%)',
          boxShadow: `
            inset -2px 2px 8px ${theme.text}08,
            -4px 0 16px rgba(0,0,0,0.1)
          `,
        }}
      />

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
          borderRadius: isOpen ? '8px 0 0 8px' : '0',
          clipPath: isOpen
            ? 'none'
            : 'polygon(100% 0, 100% 100%, 0 100%, 40% 50%)',
        }}
      />

      {/* Content: Word count when closed, close indicator when open */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
        style={{ opacity: 1 }}
      >
        {isOpen ? (
          // Close indicator (chevron pointing right)
          <span
            className="text-lg font-medium opacity-50"
            style={{ color: theme.text }}
          >
            ›
          </span>
        ) : (
          // Word count display when closed
          <div
            className="flex flex-col items-center justify-center"
            style={{
              transform: 'translateX(8px)',
            }}
          >
            <span
              className="text-lg font-bold tabular-nums leading-none"
              style={{ color: theme.text }}
            >
              {wordCount}
            </span>
            <span
              className="text-[8px] uppercase tracking-wider opacity-60 mt-0.5"
              style={{ color: theme.text }}
            >
              words
            </span>
          </div>
        )}
      </div>

      {/* Fold crease line (only when closed) */}
      {!isOpen && stage === 'closed' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg,
              transparent 38%,
              ${theme.text}12 40%,
              ${theme.text}06 42%,
              transparent 44%)`,
          }}
        />
      )}

      {/* Directional arrow affordance (harmonica mode only) */}
      {harmonicaMode && arrowDirection && (
        <DirectionArrow
          direction={arrowDirection}
          theme={theme}
          animate={!hasSeenPanel && stage === 'closed'}
        />
      )}
    </button>
  );
};

export default CornerFoldTab;
