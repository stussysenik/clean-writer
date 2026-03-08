import { RisoTheme } from "./types";
import {
  generateThemeHighlights,
  generateThemeRhymeColors,
} from "./utils/themeColorGenerator";

export const THEME_STORAGE_KEY = "clean_writer_theme";
export const FONT_STORAGE_KEY = "clean_writer_font";
export const BUILD_NUMBER = `v${__APP_VERSION__}`;
export const BUILD_TRACK = __BUILD_TRACK__;
export const BUILD_HASH = __BUILD_HASH__;
export const BUILD_IDENTITY = `${BUILD_NUMBER} · ${BUILD_TRACK} · ${BUILD_HASH}`;

export const FONT_CATEGORIES = ["Mono", "Sans-serif", "Serif", "Handwriting"] as const;
export type FontCategory = (typeof FONT_CATEGORIES)[number];

export const FONT_OPTIONS = [
  // Mono
  {
    id: "courier-prime",
    name: "Courier Prime",
    family: '"Courier Prime", monospace',
    category: "Mono" as FontCategory,
  },
  {
    id: "space-mono",
    name: "Space Mono",
    family: '"Space Mono", monospace',
    category: "Mono" as FontCategory,
  },
  {
    id: "jetbrains",
    name: "JetBrains Mono",
    family: '"JetBrains Mono", monospace',
    category: "Mono" as FontCategory,
  },
  {
    id: "fira-code",
    name: "Fira Code",
    family: '"Fira Code", monospace',
    category: "Mono" as FontCategory,
  },
  {
    id: "ibm-plex-mono",
    name: "IBM Plex Mono",
    family: '"IBM Plex Mono", monospace',
    category: "Mono" as FontCategory,
  },
  // Sans-serif
  {
    id: "inter",
    name: "Inter",
    family: '"Inter", sans-serif',
    category: "Sans-serif" as FontCategory,
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    family: '"DM Sans", sans-serif',
    category: "Sans-serif" as FontCategory,
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    family: '"Plus Jakarta Sans", sans-serif',
    category: "Sans-serif" as FontCategory,
  },
  {
    id: "helvetica",
    name: "Helvetica",
    family: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    category: "Sans-serif" as FontCategory,
  },
  {
    id: "rubik",
    name: "Rubik",
    family: '"Rubik", sans-serif',
    category: "Sans-serif" as FontCategory,
  },
  {
    id: "system",
    name: "System",
    family: "system-ui, -apple-system, sans-serif",
    category: "Sans-serif" as FontCategory,
  },
  // Serif
  {
    id: "lora",
    name: "Lora",
    family: '"Lora", serif',
    category: "Serif" as FontCategory,
  },
  {
    id: "merriweather",
    name: "Merriweather",
    family: '"Merriweather", serif',
    category: "Serif" as FontCategory,
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: '"Playfair Display", serif',
    category: "Serif" as FontCategory,
  },
  {
    id: "eb-garamond",
    name: "EB Garamond",
    family: '"EB Garamond", serif',
    category: "Serif" as FontCategory,
  },
  // Handwriting
  {
    id: "caveat",
    name: "Caveat",
    family: '"Caveat", cursive',
    category: "Handwriting" as FontCategory,
  },
] as const;

export type FontId = (typeof FONT_OPTIONS)[number]["id"];

/**
 * Build a complete theme with OKLCH-computed highlight + rhyme color palettes.
 * Core identity (text, background, accent, cursor, strikethrough, selection) stays
 * hand-picked; derived colors are computed for perceptual uniformity.
 */
function buildTheme(base: Omit<RisoTheme, "highlight" | "rhymeColors">): RisoTheme {
  return {
    ...base,
    highlight: generateThemeHighlights(base.accent, base.background),
    rhymeColors: generateThemeRhymeColors(base.accent, base.background),
  };
}

export const THEMES: RisoTheme[] = [
  buildTheme({
    id: "classic",
    name: "Classic",
    text: "#333333",
    background: "#FDFBF7",
    accent: "#F15060",
    cursor: "#F15060",
    strikethrough: "#F15060",
    selection: "rgba(241,80,96,0.2)",
  }),
  buildTheme({
    id: "blueprint",
    name: "Blueprint",
    text: "#FDFBF7",
    background: "#0078BF",
    accent: "#FFE800",
    cursor: "#FFE800",
    strikethrough: "#FFFFFF",
    selection: "rgba(255,232,0,0.3)",
  }),
  buildTheme({
    id: "midnight",
    name: "Midnight",
    text: "#e8e8e8",
    background: "#1a1a2e",
    accent: "#00d9ff",
    cursor: "#00d9ff",
    strikethrough: "#ff79c6",
    selection: "rgba(0,217,255,0.2)",
  }),
  buildTheme({
    id: "sepia",
    name: "Sepia",
    text: "#5c4b37",
    background: "#f4ecd8",
    accent: "#8b6914",
    cursor: "#8b6914",
    strikethrough: "#a65d3f",
    selection: "rgba(139,105,20,0.2)",
  }),
  buildTheme({
    id: "paper",
    name: "Paper",
    text: "#1A1A1A",
    background: "#FFFFFF",
    accent: "#2563EB",
    cursor: "#2563EB",
    strikethrough: "#DC2626",
    selection: "rgba(37,99,235,0.2)",
  }),
  buildTheme({
    id: "terminal",
    name: "Terminal",
    text: "#00FF00",
    background: "#0C0C0C",
    accent: "#00FF00",
    cursor: "#00FF00",
    strikethrough: "#FF6600",
    selection: "rgba(0,255,0,0.2)",
  }),
  buildTheme({
    id: "warmth",
    name: "Warmth",
    text: "#4A3728",
    background: "#FFF8F0",
    accent: "#D97706",
    cursor: "#D97706",
    strikethrough: "#DC2626",
    selection: "rgba(217,119,6,0.2)",
  }),
  buildTheme({
    id: "ocean",
    name: "Ocean",
    text: "#E2E8F0",
    background: "#0F172A",
    accent: "#38BDF8",
    cursor: "#38BDF8",
    strikethrough: "#F472B6",
    selection: "rgba(56,189,248,0.2)",
  }),
  buildTheme({
    id: "forest",
    name: "Forest",
    text: "#D4E5D4",
    background: "#1A2F1A",
    accent: "#4ADE80",
    cursor: "#4ADE80",
    strikethrough: "#FCA5A5",
    selection: "rgba(74,222,128,0.2)",
  }),
  buildTheme({
    id: "flexoki-light",
    name: "Flexoki Light",
    text: "#100F0F",
    background: "#FFFCF0",
    accent: "#205EA6",
    cursor: "#100F0F",
    strikethrough: "#AF3029",
    selection: "rgba(32,94,166,0.2)",
  }),
  buildTheme({
    id: "flexoki-dark",
    name: "Flexoki Dark",
    text: "#FFFCF0",
    background: "#100F0F",
    accent: "#4385BE",
    cursor: "#FFFCF0",
    strikethrough: "#D14D41",
    selection: "rgba(67,133,190,0.3)",
  }),
  buildTheme({
    id: "apple-music",
    name: "Apple Music",
    text: "#1D1D1F",
    background: "#FFFFFF",
    accent: "#FC3C44",
    cursor: "#FC3C44",
    strikethrough: "#86868B",
    selection: "rgba(252, 60, 68, 0.15)",
  }),
  buildTheme({
    id: "spotify",
    name: "Spotify",
    text: "#FFFFFF",
    background: "#121212",
    accent: "#1DB954",
    cursor: "#1DB954",
    strikethrough: "#535353",
    selection: "rgba(29, 185, 84, 0.25)",
  }),
  buildTheme({
    id: "soundcloud",
    name: "SoundCloud",
    text: "#333333",
    background: "#FFFFFF",
    accent: "#FF5500",
    cursor: "#FF5500",
    strikethrough: "#999999",
    selection: "rgba(255, 85, 0, 0.12)",
  }),
  buildTheme({
    id: "deezer",
    name: "Deezer",
    text: "#F5F5F5",
    background: "#121216",
    accent: "#A238FF",
    cursor: "#A238FF",
    strikethrough: "#555555",
    selection: "rgba(162, 56, 255, 0.25)",
  }),
];

export const MOCK_ANALYSIS_DELAY = 1500; // ms

// Song Mode: 8 rhyme highlight colors — OKLCH-uniform ocean palette (base hue 210°, L=0.55, C=0.14)
// Kept as fallback default for custom themes without rhymeColors
export const RHYME_COLORS = [
  "#D85B73", // rose
  "#F3DD3E", // yellow
  "#34C6E3", // cyan
  "#B08D3B", // bronze
  "#4C7BE8", // cobalt
  "#2EEA2B", // green
  "#E3952E", // orange
  "#64BCEC", // sky
] as const;
