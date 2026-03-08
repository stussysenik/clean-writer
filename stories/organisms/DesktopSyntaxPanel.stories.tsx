import type { Meta, StoryObj } from "@storybook/react-vite";
import DesktopSyntaxPanel from "../../components/UnifiedSyntaxPanel/DesktopSyntaxPanel";
import {
  CLASSIC_THEME,
  MIDNIGHT_THEME,
  ALL_HIGHLIGHTS_ON,
  SAMPLE_CONTENT,
  SAMPLE_SYNTAX_ANALYSIS,
  SAMPLE_SYNTAX_SETS,
} from "../_mocks";

const meta: Meta<typeof DesktopSyntaxPanel> = {
  title: "Organisms/DesktopSyntaxPanel",
  component: DesktopSyntaxPanel,
  parameters: { layout: "padded" },
  args: {
    theme: CLASSIC_THEME,
    wordCount: 162,
    content: SAMPLE_CONTENT,
    syntaxData: SAMPLE_SYNTAX_ANALYSIS,
    syntaxSets: SAMPLE_SYNTAX_SETS,
    highlightConfig: ALL_HIGHLIGHTS_ON,
    onToggleHighlight: () => {},
    soloMode: null,
    onSoloToggle: () => {},
    onCategoryHover: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: "320px", minHeight: "500px" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DesktopSyntaxPanel>;

export const Default: Story = {};

export const WithSongData: Story = {};

export const DarkTheme: Story = {
  args: { theme: MIDNIGHT_THEME },
  parameters: { backgrounds: { default: "midnight" } },
};

export const FewWords: Story = {
  args: {
    wordCount: 4,
    content: "hello world foo bar",
  },
};
