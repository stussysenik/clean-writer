import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Typewriter from "../../components/Typewriter";
import Toolbar from "../../components/Toolbar";
import ThemeSelector from "../../components/Toolbar/ThemeSelector";
import TouchButton from "../../components/TouchButton";
import Tooltip from "../../components/Tooltip";
import {
  MIDNIGHT_THEME,
  SAMPLE_CONTENT,
  SAMPLE_SYNTAX_SETS,
  ALL_HIGHLIGHTS_ON,
} from "../_mocks";
import { THEMES } from "../../constants";

const noop = () => {};

const EditorDarkTemplate = () => {
  const [content, setContent] = React.useState(SAMPLE_CONTENT);
  const theme = MIDNIGHT_THEME;

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* Top bar */}
      <div className="flex items-start justify-between px-4 pt-4">
        <ThemeSelector
          currentTheme={theme}
          themeId="midnight"
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
        </div>
      </div>

      {/* Editor */}
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

      {/* Toolbar */}
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
  title: "Templates/EditorDark",
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "midnight" },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <EditorDarkTemplate />,
};
