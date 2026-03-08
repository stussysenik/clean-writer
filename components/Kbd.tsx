import React from "react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { RisoTheme } from "../types";

interface KbdProps {
  children?: React.ReactNode;
  theme: RisoTheme;
  /** TanStack hotkey string — auto-formatted for current platform via formatForDisplay */
  hotkey?: string;
}

const Kbd: React.FC<KbdProps> = ({ children, theme, hotkey }) => (
  <kbd
    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center"
    style={{
      backgroundColor: `${theme.text}10`,
      border: `1px solid ${theme.text}15`,
      color: theme.text,
    }}
  >
    {hotkey ? formatForDisplay(hotkey) : children}
  </kbd>
);

export default Kbd;
