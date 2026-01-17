import React from 'react';
import { useTouch } from '../hooks/useTouch';

interface TouchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  children: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  onMouseDown?: (e: React.MouseEvent) => void;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  onClick,
  disabled = false,
  title,
  className = '',
  children,
  hapticFeedback = 'light',
  onMouseDown,
}) => {
  const touchHandlers = useTouch({
    onTap: disabled ? undefined : onClick,
    hapticFeedback,
  });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseDown={onMouseDown}
      {...touchHandlers}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </button>
  );
};

export default TouchButton;
