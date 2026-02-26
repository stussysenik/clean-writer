import type { Meta, StoryObj } from "@storybook/react-vite";
import ThemeSelector from "../../components/Toolbar/ThemeSelector";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";
import { THEMES } from "../../constants";

const meta: Meta<typeof ThemeSelector> = {
  title: "Molecules/ThemeSelector",
  component: ThemeSelector,
  args: {
    currentTheme: CLASSIC_THEME,
    themeId: "classic",
    onThemeChange: () => {},
    orderedThemes: THEMES,
  },
};
export default meta;
type Story = StoryObj<typeof ThemeSelector>;

export const Default: Story = {};

export const MidnightSelected: Story = {
  args: {
    currentTheme: MIDNIGHT_THEME,
    themeId: "midnight",
  },
  parameters: { backgrounds: { default: "midnight" } },
};

export const WithHiddenThemes: Story = {
  args: {
    hiddenThemeIds: ["blueprint", "sepia", "terminal", "warmth", "ocean", "forest", "flexoki-light"],
  },
};

export const WithEditBadges: Story = {
  args: {
    hasOverridesForTheme: (id: string) => id === "classic" || id === "midnight",
  },
};
