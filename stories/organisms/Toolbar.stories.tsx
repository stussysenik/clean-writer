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
    maxWidth: 800,
    hasStrikethroughs: false,
    fontSizeOffset: 0,
    onFontSizeChange: () => {},
    onToggleView: () => {},
    onStrikethrough: () => {},
    onCleanStrikethroughs: () => {},
    onExport: () => {},
    onClear: () => {},
    onWidthChange: () => {},
    onSampleText: () => {},
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

export const NarrowWidth: Story = {
  args: { maxWidth: 400 },
};

export const WideWidth: Story = {
  args: { maxWidth: 1200 },
};

export const FontSizeIncreased: Story = {
  args: { fontSizeOffset: 3 },
};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};
