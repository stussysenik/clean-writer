import type { Preview } from "@storybook/react-vite";
import "../index.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "paper",
      values: [
        { name: "paper", value: "#FDFBF7" },
        { name: "white", value: "#FFFFFF" },
        { name: "midnight", value: "#1a1a2e" },
        { name: "dark", value: "#121212" },
      ],
    },
  },
};

export default preview;
