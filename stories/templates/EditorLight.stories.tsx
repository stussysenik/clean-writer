import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Typewriter from "../../components/Typewriter";
import Toolbar from "../../components/Toolbar";
import ThemeSelector from "../../components/Toolbar/ThemeSelector";
import TouchButton from "../../components/TouchButton";
import Tooltip from "../../components/Tooltip";
import {
  CLASSIC_THEME,
  SAMPLE_CONTENT,
  SAMPLE_SYNTAX_SETS,
  ALL_HIGHLIGHTS_ON,
} from "../_mocks";
import { THEMES } from "../../constants";

const noop = () => {};

const EditorLightTemplate = () => {
  const [content, setContent] = React.useState(SAMPLE_CONTENT);
  const theme = CLASSIC_THEME;

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* Top bar: themes + controls */}
      <div className="flex items-start justify-between px-4 pt-4">
        <ThemeSelector
          currentTheme={theme}
          themeId="classic"
          onThemeChange={noop}
          orderedThemes={THEMES}
        />
        <div className="flex items-center gap-2">
          <Tooltip content="Decrease font size">
            <TouchButton onClick={noop} className="p-1 rounded opacity-60 hover:opacity-100">
              <span className="text-sm font-mono" style={{ color: theme.text }}>A-</span>
            </TouchButton>
          </Tooltip>
          <span className="text-xs opacity-40 font-mono">0</span>
          <Tooltip content="Increase font size">
            <TouchButton onClick={noop} className="p-1 rounded opacity-60 hover:opacity-100">
              <span className="text-sm font-mono font-bold" style={{ color: theme.text }}>A+</span>
            </TouchButton>
          </Tooltip>
          <Tooltip content="Help">
            <TouchButton onClick={noop} className="p-2 rounded-lg opacity-60 hover:opacity-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </TouchButton>
          </Tooltip>
          <Tooltip content="Settings">
            <TouchButton onClick={noop} className="p-2 rounded-lg opacity-60 hover:opacity-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </TouchButton>
          </Tooltip>
        </div>
      </div>

      {/* Editor area */}
      <main className="flex-1 overflow-y-auto px-4">
        <Typewriter
          content={content}
          setContent={setContent}
          theme={theme}
          syntaxSets={SAMPLE_SYNTAX_SETS}
          highlightConfig={ALL_HIGHLIGHTS_ON}
          fontSize={18}
          maxWidth={800}
          fontFamily='"Space Mono", monospace'
        />
      </main>

      {/* Bottom toolbar */}
      <Toolbar
        theme={theme}
        viewMode="write"
        maxWidth={800}
        hasStrikethroughs={false}
        fontSizeOffset={0}
        onFontSizeChange={noop}
        onToggleView={noop}
        onStrikethrough={noop}
        onCleanStrikethroughs={noop}
        onExport={noop}
        onClear={noop}
        onWidthChange={noop}
        onSampleText={noop}
      />
    </div>
  );
};

const meta: Meta = {
  title: "Templates/EditorLight",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <EditorLightTemplate />,
};
