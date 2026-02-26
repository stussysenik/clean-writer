import type { Meta, StoryObj } from "@storybook/react-vite";
import Toast from "../../components/Toast";

const meta: Meta<typeof Toast> = {
  title: "Atoms/Toast",
  component: Toast,
  args: {
    isVisible: true,
    onDismiss: () => {},
    duration: 0, // don't auto-dismiss in stories
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Info: Story = {
  args: { message: "Text copied to clipboard", type: "info" },
};

export const Warning: Story = {
  args: { message: "Forward-only mode: deletion disabled", type: "warning" },
};

export const Error: Story = {
  args: { message: "Export failed", type: "error" },
};

export const Success: Story = {
  args: { message: "File exported successfully", type: "success" },
};
