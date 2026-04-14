import React, { useEffect, useRef } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { RisoTheme } from "../types";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  theme: RisoTheme;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  theme,
  title = "Start Fresh?",
  message,
  confirmLabel = "CLEAR PAGE",
  cancelLabel = "CANCEL",
}) => {
  // Escape has a special case in TanStack that fires even in inputs by default.
  // Delete (⌦) is Fn+Delete on Mac laptops; Backspace is the common "delete" key on Mac.
  // Auto-focusing the dialog container means none of these need ignoreInputs:false.
  useHotkey("Enter", onConfirm, { enabled: isOpen, ignoreInputs: false });
  useHotkey("Escape", onCancel, { enabled: isOpen });
  useHotkey("Delete", onCancel, { enabled: isOpen, ignoreInputs: false });
  useHotkey("Backspace", onCancel, { enabled: isOpen, ignoreInputs: false });

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultMessage = (
    <>
      This will wipe the page clean. <br />
      <span className="opacity-50 text-xs uppercase tracking-wider">
        This action cannot be undone.
      </span>
    </>
  );

  const kbdStyle = (bg: string, border: string, color: string) => ({
    backgroundColor: bg,
    border: `1px solid ${border}`,
    color,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog — tabIndex lets it receive focus so hotkeys fire without fighting the textarea */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white p-8 rounded-lg shadow-xl max-w-sm w-full border-2 transform transition-all scale-100 opacity-100 outline-none"
        style={{
          borderColor: theme.accent,
          fontFamily: '"Space Mono", monospace',
          backgroundColor: theme.background,
          color: theme.text,
        }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: theme.highlight.verb }}
        >
          {title}
        </h2>
        <p className="mb-8 opacity-70 text-sm leading-relaxed">
          {message || defaultMessage}
        </p>

        <div className="flex justify-end gap-4 items-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
            style={{ color: theme.text }}
          >
            {cancelLabel}
            <span className="flex items-center gap-1">
              <kbd
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                style={kbdStyle(`${theme.text}10`, `${theme.text}20`, theme.text)}
              >
                Esc
              </kbd>
              <kbd
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                style={kbdStyle(`${theme.text}10`, `${theme.text}20`, theme.text)}
              >
                ⌫
              </kbd>
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-bold text-white rounded shadow-sm hover:scale-105 transition-transform flex items-center gap-2"
            style={{ backgroundColor: theme.highlight.verb }}
          >
            {confirmLabel}
            <kbd
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
              style={kbdStyle("rgba(255,255,255,0.2)", "rgba(255,255,255,0.35)", "white")}
            >
              ↵
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
