import type { Meta, StoryObj } from "@storybook/react-vite";
import Toolbar from "../../components/Toolbar";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof Toolbar> = {
  title: "Organisms/Toolbar",
  component: Toolbar,
  parameters: { layout: "fullscreen" },
  args: {
    theme: CLASSIC_THEME,
    viewMode: "write",
    hasStrikethroughs: false,
    focusMode: "none",
    onToggleView: () => {},
    onStrikethrough: () => {},
    onCleanStrikethroughs: () => {},
    onExport: () => {},
    onClear: () => {},
    onSampleText: () => {},
    onCycleFocusMode: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: "200px", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const WriteMode: Story = {};

export const PreviewMode: Story = {
  args: { viewMode: "preview" },
};

export const WithStrikethroughs: Story = {
  args: { hasStrikethroughs: true },
};

export const SentenceFocus: Story = {
  args: { focusMode: "sentence" },
};

export const ParagraphFocus: Story = {
  args: { focusMode: "paragraph" },
};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};
