import React from "react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { SHORTCUTS } from "../../constants/shortcuts";

interface GuideSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  textColor: string;
  accentColor: string;
}

const GROUPS = [
  {
    title: "Core rhythm",
    ids: ["preview", "plain-mode", "export"],
  },
  {
    title: "Editing",
    ids: ["strikethrough", "clean", "delete-all"],
  },
  {
    title: "Focus mode",
    ids: ["focus-cycle", "focus-left", "focus-right", "focus-exit"],
  },
] as const;

const GuideSection: React.FC<GuideSectionProps> = ({
  isExpanded,
  onToggle,
  textColor,
  accentColor,
}) => {
  return (
    <section className="px-2 pt-3" data-testid="sidebar-guide-section">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: `${textColor}12`,
          backgroundColor: `${textColor}05`,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
          aria-expanded={isExpanded}
          aria-controls="sidebar-guide-panel"
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: accentColor }}
            >
              Guide
            </p>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: textColor, opacity: 0.62 }}
            >
              Open the rules of the tool without covering the page.
            </p>
          </div>
          <span
            className="text-[11px] uppercase tracking-[0.2em] flex-shrink-0"
            style={{ color: textColor, opacity: 0.42 }}
          >
            {isExpanded ? "Hide" : "Open"}
          </span>
        </button>

        {isExpanded && (
          <div id="sidebar-guide-panel" className="px-4 pb-4">
            <div className="grid gap-3">
              {GROUPS.map((group) => {
                const items = SHORTCUTS.filter((shortcut) =>
                  group.ids.some((id) => id === shortcut.id),
                );

                return (
                  <div
                    key={group.title}
                    className="rounded-xl border px-3 py-3"
                    style={{
                      borderColor: `${textColor}10`,
                      backgroundColor: `${textColor}04`,
                    }}
                  >
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
                      style={{ color: textColor, opacity: 0.38 }}
                    >
                      {group.title}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3"
                        >
                          <span
                            className="text-[12px] leading-relaxed"
                            style={{ color: textColor, opacity: 0.72 }}
                          >
                            {item.label}
                          </span>
                          <kbd
                            className="px-2 py-1 rounded-full text-[10px] font-mono font-semibold"
                            style={{
                              color: textColor,
                              backgroundColor: `${textColor}10`,
                              border: `1px solid ${textColor}12`,
                            }}
                          >
                            {formatForDisplay(item.hotkey)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              className="text-[11px] leading-relaxed mt-3"
              style={{ color: textColor, opacity: 0.5 }}
            >
              Writing stays local by default. Feedback notes are saved locally
              too, then synced only when Supabase is configured.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GuideSection;
