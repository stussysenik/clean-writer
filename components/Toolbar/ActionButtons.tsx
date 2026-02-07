import React, { useState } from 'react';
import { RisoTheme, ViewMode } from '../../types';
import { IconEyeOpen, IconEyeClosed, IconStrike, IconDownload, IconTrash, IconWidth } from './Icons';
import TouchButton from '../TouchButton';
import Tooltip from '../Tooltip';
import { getIconColor } from '../../utils/contrastAwareColor';

interface ActionButtonsProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onStrikethroughPointerDown?: () => void;
  onExport: () => void;
  onClear: () => void;
  onWidthChange: (width: number) => void;
}

interface ActionButtonProps {
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  className?: string;
  ariaLabel?: string;
  'data-testid'?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  onMouseDown,
  onPointerDown,
  onTouchStart,
  disabled = false,
  icon,
  label,
  tooltip,
  className = '',
  ariaLabel,
  'data-testid': dataTestId,
}) => (
  <Tooltip content={tooltip} position="top" delay={400}>
    <TouchButton
      onClick={onClick}
      onMouseDown={onMouseDown}
      onPointerDown={onPointerDown}
      onTouchStart={onTouchStart}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-150 hover:bg-current/5 ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-60 hover:opacity-100'
      } ${className}`}
      title={tooltip}
      aria-label={ariaLabel || tooltip}
      data-testid={dataTestId}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-[9px] uppercase tracking-wider font-medium hidden sm:block">{label}</span>
    </TouchButton>
  </Tooltip>
);

const ActionButtons: React.FC<ActionButtonsProps> = ({
  theme,
  viewMode,
  maxWidth,
  onToggleView,
  onStrikethrough,
  onStrikethroughPointerDown,
  onExport,
  onClear,
  onWidthChange,
}) => {
  const [showWidthControl, setShowWidthControl] = useState(false);
  const iconColor = getIconColor(theme);

  return (
    <div className="flex flex-wrap gap-1 md:gap-2 items-center" style={{ color: iconColor }}>
      <ActionButton
        onClick={onToggleView}
        icon={viewMode === 'write' ? <IconEyeOpen /> : <IconEyeClosed />}
        label={viewMode === 'write' ? 'Preview' : 'Edit'}
        tooltip={viewMode === 'write' ? 'Preview markdown' : 'Back to editing'}
        ariaLabel={viewMode === 'write' ? 'Preview markdown' : 'Switch to edit mode'}
      />

      <ActionButton
        onClick={onStrikethrough}
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={onStrikethroughPointerDown}
        onTouchStart={onStrikethroughPointerDown}
        disabled={viewMode === 'preview'}
        icon={<IconStrike />}
        label="Strike"
        tooltip="Apply strikethrough to selected text"
        ariaLabel="Strikethrough selected text"
        data-testid="strikethrough-btn"
      />

      <ActionButton
        onClick={onExport}
        icon={<IconDownload />}
        label="Export"
        tooltip="Download as markdown file"
        ariaLabel="Export markdown file"
      />

      <ActionButton
        onClick={onClear}
        icon={<IconTrash />}
        label="Clear"
        tooltip="Clear all content"
        ariaLabel="Clear all content"
        className="hover:text-red-500"
      />

      {/* Width Control */}
      <div className="relative flex items-center">
        <Tooltip content="Adjust line width" position="top" delay={400}>
          <TouchButton
            onClick={() => setShowWidthControl(!showWidthControl)}
            className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-150 hover:bg-current/5 ${
              showWidthControl ? 'opacity-100 bg-current/5' : 'opacity-60 hover:opacity-100'
            }`}
            title="Adjust line width"
            aria-label="Adjust line width"
            aria-expanded={showWidthControl}
          >
            <span className="flex items-center justify-center"><IconWidth /></span>
            <span className="text-[9px] uppercase tracking-wider font-medium hidden sm:block">Width</span>
          </TouchButton>
        </Tooltip>

        {showWidthControl && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 shadow-lg rounded-xl backdrop-blur-sm flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border"
            style={{
              backgroundColor: `${theme.background}f5`,
              borderColor: `${theme.text}15`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-50 w-8 text-center">300</span>
              <input
                type="range"
                min="300"
                max="1400"
                step="50"
                value={maxWidth}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                className="w-28 h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: theme.accent,
                  background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((maxWidth - 300) / 1100) * 100}%, ${theme.text}20 ${((maxWidth - 300) / 1100) * 100}%, ${theme.text}20 100%)`,
                }}
                aria-label="Line width"
              />
              <span className="text-xs opacity-50 w-8 text-center">1400</span>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${theme.text}10` }}
            >
              {maxWidth}px
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
