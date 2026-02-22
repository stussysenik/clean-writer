/**
 * Design Tokens — Czech Warm Functionalism
 *
 * Informed by Czech government design principles:
 * - Warm minimalism (ochre, brown, deep-blue, dark-green palette philosophy)
 * - WCAG 2.1 AA minimum contrast ratios
 * - 44px minimum touch targets (Fitts's Law)
 * - Golden ratio (φ = 1.618) aligned spacing
 * - Geometric clarity in layout
 */

// Touch target compliance (WCAG 2.5.5 Level AAA: 44x44px)
export const TOUCH = {
  minTarget: 44, // px — minimum interactive element size
  minSpacing: 8, // px — minimum gap between targets
  activePadding: 12, // px — padding to enlarge small hit areas
} as const;

// Typography scale — modular scale with 1.25 ratio (Major Third)
export const TYPE_SCALE = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  "4xl": "3rem", // 48px
} as const;

// Line height: 1.625 (26px at 16px base = golden ratio aligned)
export const LINE_HEIGHT = {
  tight: 1.25,
  normal: 1.625, // golden ratio: 26/16 ≈ φ
  relaxed: 1.75,
} as const;

// WCAG contrast thresholds
export const CONTRAST = {
  bodyText: 4.5, // AA for normal text
  largeText: 3, // AA for large text (≥18pt or ≥14pt bold)
  uiComponent: 3, // AA for UI components and graphical objects
  enhanced: 7, // AAA for normal text
} as const;

// Semantic colors — Czech warm functionalism palette
export const SEMANTIC = {
  // Warm earth tones as accents
  ochre: "#B45309",
  brown: "#78350F",
  deepBlue: "#1E3A5F",
  darkGreen: "#166534",
  warmGray: "#78716C",

  // Feedback colors
  success: "#166534",
  warning: "#92400E",
  error: "#991B1B",
  info: "#1E40AF",
} as const;

// Animation tokens
export const MOTION = {
  durationFast: "150ms",
  durationNormal: "300ms",
  durationSlow: "500ms",
  easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
