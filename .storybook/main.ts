import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  viteFinal: (config) => {
    // Inherit the app's Vite define config for build constants
    config.define = {
      ...config.define,
      __APP_VERSION__: JSON.stringify("0.0.0"),
      __BUILD_TRACK__: JSON.stringify("storybook"),
      __BUILD_HASH__: JSON.stringify("dev"),
    };
    return config;
  },
};
export default config;
