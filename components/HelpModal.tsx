import React from "react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { RisoTheme } from "../types";
import { SHORTCUTS } from "../constants/shortcuts";
import TouchButton from "./TouchButton";
import Kbd from "./Kbd";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RisoTheme;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const editing = SHORTCUTS.filter((s) => s.category === "editing");
  const view = SHORTCUTS.filter((s) => s.category === "view");
  const focus = SHORTCUTS.filter((s) => s.category === "focus");
  const debug = SHORTCUTS.filter((s) => s.category === "debug");

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

        {/* Editing Shortcuts */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Editing
          </h3>
          <div className="space-y-3 text-sm">
            {editing.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 border-b border-current/10"
              >
                <span className="opacity-70">{s.label}</span>
                <Kbd theme={theme} hotkey={s.hotkey} />
              </div>
            ))}
          </div>
        </section>

        {/* View Shortcuts */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            View
          </h3>
          <div className="space-y-3 text-sm">
            {view.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 border-b border-current/10"
              >
                <span className="opacity-70">{s.label}</span>
                <Kbd theme={theme} hotkey={s.hotkey} />
              </div>
            ))}
          </div>
        </section>

        {/* Word Types */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Word Types
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Toggle word types</span>
              <Kbd theme={theme}>1 – 9</Kbd>
            </div>
          </div>
        </section>

        {/* Focus Mode */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Focus Mode
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Navigate in focus mode</span>
              <Kbd theme={theme}>← →</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Change focus level</span>
              <Kbd theme={theme}>↑ ↓</Kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-current/10">
              <span className="opacity-70">Exit focus mode</span>
              <Kbd theme={theme} hotkey="Escape" />
            </div>
          </div>
        </section>

        {/* Debug */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Debug
          </h3>
          <div className="space-y-3 text-sm">
            {debug.map((s, i) => (
              <div
                key={s.id}
                className={`flex justify-between items-center py-2${i < debug.length - 1 ? " border-b border-current/10" : ""}`}
              >
                <span className="opacity-70">{s.label}</span>
                <Kbd theme={theme} hotkey={s.hotkey} />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile */}
        <section className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">
            Mobile
          </h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li>Select text + tap strikethrough to mark, then "Clean" to remove</li>
            <li>In Focus mode, tap the text to target a word, sentence, or paragraph</li>
            <li>Tap a color dot to switch themes, swipe to cycle</li>
            <li>Open Settings to reorder, hide, or customize themes</li>
          </ul>
        </section>

        {/* Privacy */}
        <p className="text-xs opacity-50 text-center">
          Your work stays in your browser — nothing leaves this device.
        </p>
      </div>
    </>
  );
};

export default HelpModal;
