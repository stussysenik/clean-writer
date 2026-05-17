import React, { useState, useEffect, useRef, useCallback } from "react";
import { RisoTheme } from "../types";
import Kbd from "./Kbd";

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  category: string;
  keywords?: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  theme: RisoTheme;
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  theme,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = commands.filter(
    (cmd) =>
      fuzzyMatch(cmd.label, query) ||
      cmd.keywords?.some((k) => fuzzyMatch(k, query)) ||
      (cmd.shortcut && fuzzyMatch(cmd.shortcut, query))
  );

  // Group by category
  const grouped: Record<string, CommandItem[]> = {};
  for (const cmd of filtered) {
    const cat = cmd.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(cmd);
  }

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      onClose();
      setTimeout(() => cmd.action(), 10);
    },
    [onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) executeCommand(cmd);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: theme.background,
          borderColor: `${theme.text}15`,
          color: theme.text,
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: `${theme.text}10` }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.4, flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: theme.text }}
            spellCheck={false}
            autoComplete="off"
          />
          <Kbd theme={theme}>esc</Kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[320px] overflow-y-auto py-2"
        >
          {filtered.length === 0 && (
            <div
              className="px-4 py-8 text-center text-sm"
              style={{ opacity: 0.4 }}
            >
              No commands found
            </div>
          )}

          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div
                className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ opacity: 0.25 }}
              >
                {category}
              </div>
              {cmds.map((cmd, i) => {
                const globalIndex = filtered.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    data-selected={globalIndex === selectedIndex}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors mx-1 rounded-md"
                    style={{
                      backgroundColor:
                        globalIndex === selectedIndex
                          ? `${theme.accent}14`
                          : "transparent",
                    }}
                  >
                    <span
                      className="flex-1 text-sm"
                      style={{
                        opacity:
                          globalIndex === selectedIndex ? 1 : 0.7,
                        fontWeight:
                          globalIndex === selectedIndex ? 500 : 400,
                      }}
                    >
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <Kbd theme={theme}>{cmd.shortcut}</Kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-t text-[10px]"
          style={{
            borderColor: `${theme.text}08`,
            opacity: 0.35,
          }}
        >
          <span className="flex items-center gap-1">
            <Kbd theme={theme}>↑↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd theme={theme}>↵</Kbd>
            Execute
          </span>
          <span className="flex items-center gap-1">
            <Kbd theme={theme}>esc</Kbd>
            Dismiss
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
