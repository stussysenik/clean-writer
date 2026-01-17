import React, { useState } from 'react';
import { RisoTheme, ViewMode } from '../../types';
import { IconEyeOpen, IconEyeClosed, IconStrike, IconDownload, IconTrash, IconWidth } from './Icons';
import TouchButton from '../TouchButton';

interface ActionButtonsProps {
  theme: RisoTheme;
  viewMode: ViewMode;
  maxWidth: number;
  onToggleView: () => void;
  onStrikethrough: () => void;
  onExport: () => void;
  onClear: () => void;
  onWidthChange: (width: number) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  theme,
  viewMode,
  maxWidth,
  onToggleView,
  onStrikethrough,
  onExport,
  onClear,
  onWidthChange,
}) => {
  const [showWidthControl, setShowWidthControl] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 items-center">
      <TouchButton
        onClick={onToggleView}
        className="hover:scale-110 transition-transform opacity-60 hover:opacity-100"
        title={viewMode === 'write' ? 'Preview' : 'Edit'}
      >
        {viewMode === 'write' ? <IconEyeOpen /> : <IconEyeClosed />}
      </TouchButton>

      <TouchButton
        onClick={onStrikethrough}
        onMouseDown={(e) => e.preventDefault()}
        disabled={viewMode === 'preview'}
        className="hover:scale-110 transition-transform opacity-60 hover:opacity-100 disabled:opacity-20"
        title="Strikethrough (Select text first)"
      >
        <IconStrike />
      </TouchButton>

      <TouchButton
        onClick={onExport}
        className="hover:scale-110 transition-transform opacity-60 hover:opacity-100"
        title="Export Markdown"
      >
        <IconDownload />
      </TouchButton>

      <TouchButton
        onClick={onClear}
        className="hover:scale-110 transition-transform opacity-60 hover:opacity-100 hover:text-riso-pink"
        title="Clear Content"
      >
        <IconTrash />
      </TouchButton>

      {/* Width Control */}
      <div className="relative flex items-center group">
        <TouchButton
          onClick={() => setShowWidthControl(!showWidthControl)}
          className={`hover:scale-110 transition-transform opacity-60 hover:opacity-100 ${
            showWidthControl ? 'opacity-100' : ''
          }`}
          title="Adjust Line Width"
        >
          <IconWidth />
        </TouchButton>

        {showWidthControl && (
          <div className="absolute bottom-full left-0 mb-4 p-2 bg-white/90 shadow-lg rounded-lg backdrop-blur-sm flex items-center border border-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <input
              type="range"
              min="300"
              max="1400"
              step="50"
              value={maxWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current"
              style={{ accentColor: theme.accent }}
            />
            <span className="ml-2 text-xs opacity-50 w-12 text-right">{maxWidth}px</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
