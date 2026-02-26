import type { Meta, StoryObj } from "@storybook/react-vite";
import Kbd from "../../components/Kbd";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof Kbd> = {
  title: "Atoms/Kbd",
  component: Kbd,
  args: { theme: CLASSIC_THEME },
};
export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: { children: "⌘+Shift+X" },
};

export const SingleKey: Story = {
  args: { children: "?" },
};

export const NumberKey: Story = {
  args: { children: "1 - 9" },
};

export const DarkTheme: Story = {
  args: { children: "⌘+Shift+X", theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};

export const AllShortcuts: Story = {
  render: (args) => (
    <div className="flex gap-2 flex-wrap">
      <Kbd {...args}>⌘+Shift+X</Kbd>
      <Kbd {...args}>⌘+Shift+D</Kbd>
      <Kbd {...args}>⌘+Shift+P</Kbd>
      <Kbd {...args}>1 - 9</Kbd>
      <Kbd {...args}>?</Kbd>
    </div>
  ),
  args: { children: "", theme: CLASSIC_THEME },
};
