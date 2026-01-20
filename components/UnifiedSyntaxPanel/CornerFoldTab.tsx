import React from 'react';
import { RisoTheme } from '../../types';

interface CornerFoldTabProps {
  theme: RisoTheme;
  wordCount: number;
  isOpen: boolean;
  hasSeenPanel: boolean;
  onClick: () => void;
}

const CornerFoldTab: React.FC<CornerFoldTabProps> = ({
  theme,
  wordCount,
  isOpen,
  hasSeenPanel,
  onClick,
}) => {
  const showPulse = !hasSeenPanel && !isOpen;

  return (
    <button
      onClick={onClick}
      data-testid="mobile-fold-tab"
      className={`
        relative cursor-pointer select-none touch-manipulation
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${showPulse ? 'animate-pulse' : ''}
      `}
      style={{
        // Size of the corner tab
        width: isOpen ? '36px' : '56px',
        height: isOpen ? '80px' : '80px',
        // Move tab left when panel opens (so it stays attached to panel edge)
        marginRight: isOpen ? '-2px' : '0',
        ['--tw-ring-color' as string]: theme.text,
        ['--tw-ring-offset-color' as string]: theme.background,
      }}
      aria-label={isOpen ? 'Close syntax panel' : `Open syntax panel (${wordCount} words)`}
      aria-expanded={isOpen}
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
      {!isOpen && (
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
    </button>
  );
};

export default CornerFoldTab;
