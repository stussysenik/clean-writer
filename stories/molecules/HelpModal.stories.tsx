import type { Meta, StoryObj } from "@storybook/react-vite";
import HelpModal from "../../components/HelpModal";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof HelpModal> = {
  title: "Molecules/HelpModal",
  component: HelpModal,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    onClose: () => {},
    theme: CLASSIC_THEME,
    isMac: true,
  },
};
export default meta;
type Story = StoryObj<typeof HelpModal>;

export const Mac: Story = {};

export const Windows: Story = {
  args: { isMac: false },
};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};
