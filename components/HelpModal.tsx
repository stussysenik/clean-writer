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
  const shortcutRowClass =
    "grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-x-8 py-3 sm:gap-x-10";

  const ShortcutSection = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ id: string; label: string; hotkey: string }>;
  }) => (
    <section className="min-w-0">
      <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">
        {title}
      </h3>
      <div className="space-y-1 text-sm">
        {items.map((s, index) => (
          <div
            key={s.id}
            className={`${shortcutRowClass} ${
              index < items.length - 1 ? "border-b border-current/10" : ""
            }`}
          >
            <span className="opacity-70">{s.label}</span>
            <span className="justify-self-end">
              <Kbd theme={theme} hotkey={s.hotkey} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-current/50 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        data-testid="help-modal"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-5xl max-h-[84vh] overflow-y-auto z-[101] liquid-glass p-6 md:p-10"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8">
          <div className="space-y-8 min-w-0">
            <ShortcutSection title="Editing" items={editing} />

            <section className="min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">
                Word Types
              </h3>
              <div className="space-y-1 text-sm">
                <div className={`${shortcutRowClass} border-b border-current/10`}>
                  <span className="opacity-70">Toggle word types</span>
                  <span className="justify-self-end">
                    <Kbd theme={theme}>1 – 9</Kbd>
                  </span>
                </div>
              </div>
            </section>

            <section className="min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">
                Focus Mode
              </h3>
              <div className="space-y-1 text-sm">
                <div className={`${shortcutRowClass} border-b border-current/10`}>
                  <span className="opacity-70">Navigate in focus mode</span>
                  <span className="justify-self-end">
                    <Kbd theme={theme}>← →</Kbd>
                  </span>
                </div>
                <div className={`${shortcutRowClass} border-b border-current/10`}>
                  <span className="opacity-70">Change focus level</span>
                  <span className="justify-self-end">
                    <Kbd theme={theme}>↑ ↓</Kbd>
                  </span>
                </div>
                <div className={shortcutRowClass}>
                  <span className="opacity-70">Exit focus mode</span>
                  <span className="justify-self-end">
                    <Kbd theme={theme} hotkey="Escape" />
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 min-w-0">
            <ShortcutSection title="View" items={view} />
            <ShortcutSection title="Debug" items={debug} />

            <section className="min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">
                Mobile
              </h3>
              <ul className="space-y-3 text-sm opacity-70">
                <li>Select text + tap strikethrough to mark, then clean to remove</li>
                <li>In Focus mode, tap the text to target a word, sentence, or paragraph</li>
                <li>Tap a theme chip to switch, then open settings to customize colors</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Privacy */}
        <p className="text-xs opacity-50 text-center mt-6">
          Your work stays in your browser — nothing leaves this device.
        </p>
      </div>
    </>
  );
};

export default HelpModal;
