import type { Meta, StoryObj } from "@storybook/react-vite";
import ConfirmDialog from "../../components/ConfirmDialog";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Molecules/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    onConfirm: () => {},
    onCancel: () => {},
    theme: CLASSIC_THEME,
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const ClearPage: Story = {};

export const LoadSample: Story = {
  args: {
    title: "Load Sample Text?",
    message: (
      <>
        This will replace your current content with a sample excerpt.
        <br />
        <span className="opacity-50 text-xs uppercase tracking-wider">
          YOUR EXISTING TEXT WILL BE LOST.
        </span>
      </>
    ),
    confirmLabel: "LOAD SAMPLE",
  },
};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};
