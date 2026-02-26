import type { Meta, StoryObj } from "@storybook/react-vite";
import MarkdownPreview from "../../components/MarkdownPreview";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof MarkdownPreview> = {
  title: "Organisms/MarkdownPreview",
  component: MarkdownPreview,
  parameters: { layout: "fullscreen" },
  args: {
    theme: CLASSIC_THEME,
    onBackToEdit: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: "800px", height: "600px" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MarkdownPreview>;

export const RichContent: Story = {
  args: {
    content: `# The Little Prince

> "It is the time you have wasted for your rose that makes your rose so important."

## Chapter XXI

"People have forgotten this truth," the fox said. **"But you must not forget it."**

You become responsible *forever* for what you have tamed.

---

- Roses are beautiful
- Foxes are wise
- Stars hold secrets

\`\`\`
const meaning = "love";
\`\`\``,
  },
};

export const SimpleText: Story = {
  args: {
    content:
      "Just a simple paragraph of text without any markdown formatting at all.",
  },
};

export const DarkTheme: Story = {
  args: {
    theme: MIDNIGHT_THEME,
    content: `# Dark Mode Preview

> "What is essential is invisible to the eye."

Some **bold** and *italic* text in dark mode.`,
  },
  parameters: { backgrounds: { default: "midnight" } },
};
