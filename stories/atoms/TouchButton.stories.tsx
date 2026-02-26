import type { Meta, StoryObj } from "@storybook/react-vite";
import TouchButton from "../../components/TouchButton";
import { CLASSIC_THEME, MIDNIGHT_THEME } from "../_mocks";

const meta: Meta<typeof TouchButton> = {
  title: "Atoms/TouchButton",
  component: TouchButton,
  args: { onClick: () => alert("clicked") },
};
export default meta;
type Story = StoryObj<typeof TouchButton>;

// Icon SVGs matching the app's toolbar icons
const PreviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const StrikeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4H9a3 3 0 0 0 0 6h6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <path d="M15 12a3 3 0 0 1 0 6H8" />
  </svg>
);

const ExportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const IconButton: Story = {
  args: {
    children: <PreviewIcon />,
    className: "p-2 rounded-lg hover:bg-gray-100 transition-colors",
    "aria-label": "Preview",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-1">
      <TouchButton
        onClick={() => {}}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Preview"
      >
        <PreviewIcon />
      </TouchButton>
      <span className="text-[9px] uppercase tracking-wider opacity-50">Preview</span>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: <StrikeIcon />,
    disabled: true,
    className: "p-2 rounded-lg opacity-30 cursor-not-allowed",
    "aria-label": "Strikethrough",
  },
};

export const AllToolbarButtons: Story = {
  render: () => {
    const theme = CLASSIC_THEME;
    const buttons = [
      { icon: <PreviewIcon />, label: "Preview" },
      { icon: <StrikeIcon />, label: "Strike" },
      { icon: <ExportIcon />, label: "Export" },
    ];
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-xl"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        {buttons.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <TouchButton
              onClick={() => {}}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
            >
              {b.icon}
            </TouchButton>
            <span className="text-[9px] uppercase tracking-wider opacity-50 font-mono">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

export const DarkVariant: Story = {
  render: () => (
    <div
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ backgroundColor: MIDNIGHT_THEME.background, color: MIDNIGHT_THEME.text }}
    >
      <TouchButton onClick={() => {}} className="p-2 rounded-lg hover:opacity-70">
        <PreviewIcon />
      </TouchButton>
      <TouchButton onClick={() => {}} className="p-2 rounded-lg hover:opacity-70">
        <StrikeIcon />
      </TouchButton>
      <TouchButton onClick={() => {}} className="p-2 rounded-lg hover:opacity-70">
        <ExportIcon />
      </TouchButton>
    </div>
  ),
  parameters: { backgrounds: { default: "midnight" } },
};
