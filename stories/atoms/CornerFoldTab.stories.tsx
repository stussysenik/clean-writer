import type { Meta, StoryObj } from "@storybook/react-vite";
import CornerFoldTab from "../../components/UnifiedSyntaxPanel/CornerFoldTab";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof CornerFoldTab> = {
  title: "Atoms/CornerFoldTab",
  component: CornerFoldTab,
  args: {
    theme: CLASSIC_THEME,
    wordCount: 162,
    isOpen: false,
    hasSeenPanel: true,
    onClick: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CornerFoldTab>;

export const Closed: Story = {};

export const Open: Story = {
  args: { isOpen: true },
};

export const FirstVisit: Story = {
  args: { hasSeenPanel: false },
};

export const LowWordCount: Story = {
  args: { wordCount: 4 },
};

export const HighWordCount: Story = {
  args: { wordCount: 1542 },
};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};

export const DarkThemeOpen: Story = {
  args: { theme: MIDNIGHT_THEME, isOpen: true },
  parameters: { backgrounds: { default: "midnight" } },
};
