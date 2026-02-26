import type { Meta, StoryObj } from "@storybook/react-vite";
import Tooltip from "../../components/Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: "Preview markdown",
    children: (
      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
        Hover me
      </button>
    ),
  },
};

export const WithShortcut: Story = {
  args: {
    content: "Strikethrough",
    shortcut: "⌘+Shift+X",
    children: (
      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
        Hover me
      </button>
    ),
  },
};

export const BottomPosition: Story = {
  args: {
    content: "Classic theme",
    position: "bottom",
    children: (
      <div className="w-8 h-8 rounded-full bg-red-400 cursor-pointer" />
    ),
  },
};
