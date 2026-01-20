import React from 'react';
import { useTouch } from '../hooks/useTouch';

interface TouchButtonProps {
  onClick: () => void;
  onLongPress?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  onMouseDown?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'data-testid'?: string;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  onClick,
  onLongPress,
  onDoubleClick,
  onContextMenu,
  disabled = false,
  title,
  className = '',
  style,
  children,
  hapticFeedback = 'light',
  onMouseDown,
  onPointerDown,
  onTouchStart,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'data-testid': dataTestId,
}) => {
  const touchHandlers = useTouch({
    onTap: disabled ? undefined : onClick,
    onLongPress: disabled ? undefined : onLongPress,
    hapticFeedback,
  });

  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      disabled={disabled}
      title={title}
      onMouseDown={onMouseDown}
      onPointerDown={onPointerDown}
      onTouchStart={onTouchStart}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      data-testid={dataTestId}
      {...touchHandlers}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${className}`}
      style={{ touchAction: 'manipulation', ...style }}
    >
      {children}
    </button>
  );
};

export default TouchButton;
