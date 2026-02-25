import React from "react";
import { RisoTheme } from "../types";
import TouchButton from "./TouchButton";
import Kbd from "./Kbd";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RisoTheme;
  isMac: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, theme, isMac }) => {
  if (!isOpen) return null;

  const cmdKey = isMac ? "⌘" : "Ctrl";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-current/50 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[80vh] overflow-y-auto z-[101] liquid-glass p-6 md:p-8"
        style={{
          backgroundColor: `${theme.background}f5`,
          color: theme.text,
          border: `1px solid ${theme.text}20`,
          boxShadow: `0 20px 60px ${theme.text}30`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Quick Guide</h2>
          <TouchButton
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-current/10 transition-colors"
            title="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </TouchButton>
        </div>

        {/* Desktop Shortcuts */}
        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Desktop Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Strikethrough text</span>
              <Kbd theme={theme}>{cmdKey}+Shift+X</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Clean struck text</span>
              <Kbd theme={theme}>{cmdKey}+Shift+K</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Toggle preview</span>
              <Kbd theme={theme}>{cmdKey}+Shift+P</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Export markdown</span>
              <Kbd theme={theme}>{cmdKey}+Shift+E</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Toggle word types</span>
              <Kbd theme={theme}>1-9</Kbd>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="opacity-70">Show shortcuts</span>
              <Kbd theme={theme}>Hold Tab</Kbd>
            </div>
          </div>
        </section>

        {/* Mobile Gestures */}
        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Mobile Tips
          </h3>
          <div className="space-y-3 text-sm">
            <div className="py-2 border-b border-current/10">
              <div className="font-medium mb-1">Delete Text</div>
              <div className="opacity-70 text-xs">
                Select text → tap strikethrough icon → tap "Clean" button to permanently remove
              </div>
            </div>
            <div className="py-2 border-b border-current/10">
              <div className="font-medium mb-1">Switch Themes</div>
              <div className="opacity-70 text-xs">
                Tap a color dot to switch instantly, or swipe left/right to cycle through themes
              </div>
            </div>
            <div className="py-2 border-b border-current/10">
              <div className="font-medium mb-1">Manage Themes</div>
              <div className="opacity-70 text-xs">
                Open Settings (⚙️) → Themes tab to reorder, hide, or customize colors
              </div>
            </div>
            <div className="py-2">
              <div className="font-medium mb-1">Line Width</div>
              <div className="opacity-70 text-xs">
                Use the slider in the bottom toolbar to adjust text column width
              </div>
            </div>
          </div>
        </section>

        {/* General Tips */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Features
          </h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li className="flex gap-2">
              <span style={{ color: theme.accent }}>•</span>
              <span>Click word type buttons (right panel) to toggle highlighting</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: theme.accent }}>•</span>
              <span>Your work auto-saves to browser storage</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: theme.accent }}>•</span>
              <span>Export to markdown file for use anywhere</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: theme.accent }}>•</span>
              <span>Song mode analyzes rhyme patterns and syllables</span>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default HelpModal;
