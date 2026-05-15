/**
 * Golden Ratio Spacing System
 * Based on φ = 1.618 (golden ratio)
 * Scale follows geometric progression for harmonious proportions:
 *   step(n) = round(base × φⁿ)
 */

export const PHI = 1.618;

/** Compute the golden ratio geometric scale from a base unit.
 *  Returns 7 steps [φ⁰, φ¹, φ², φ³, φ⁴, φ⁵, φ⁶] rounded to nearest integer. */
export function deriveGoldenScale(base: number, steps = 7): number[] {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    out.push(Math.round(base * PHI ** i));
  }
  return out;
}

/** Named steps of the golden scale for a given base. */
export function getNamedGoldenSteps(base: number) {
  const [xs, sm, md, lg, xl, xxl, xxxl] = deriveGoldenScale(base);
  return { xs, sm, md, lg, xl, xxl, xxxl };
}

// ─── Static golden scale (8px base — matches CSS custom properties) ──────────

export const GOLDEN_SCALE = {
  xs: 8,
  sm: 13,
  md: 21,
  lg: 34,
  xl: 55,
  xxl: 89,
} as const;

// ─── Derived-key classification ──────────────────────────────────────────────
// Keys whose values derive from baseSpacing via golden ratio.
// Each entry maps to the golden power index: 0=base, 1=sm, 2=md, …, 6=xxxl

export const DERIVED_KEY_POWER: Partial<Record<string, number>> = {
  topBarPaddingX: 1,          // sm
  topBarPaddingY: 0,          // xs
  topBarPaddingDesktopX: 2,   // md
  topBarPaddingDesktopY: 1,   // sm
  topFadeHeight: 6,           // xxxl
  toolbarPaddingX: 1,         // sm
  toolbarPaddingY: 0,         // xs
  contentBottomPadding: 4,    // xl
  contentPaddingX: 1,         // sm
  desktopPanelRight: 2,       // md
};

/** Keys that derive from baseSpacing — used by the state machine. */
export const DERIVED_KEYS = new Set(Object.keys(DERIVED_KEY_POWER));

/** Compute the derived value for a single key from the golden scale. */
export function computeDerivedValue(key: string, base: number): number {
  const power = DERIVED_KEY_POWER[key];
  if (power === undefined) return 0;
  return Math.round(base * PHI ** power);
}

/** Compute all derived overrides from a base unit. */
export function computeAllDerived(base: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of DERIVED_KEYS) {
    out[key] = computeDerivedValue(key, base);
  }
  return out;
}

// Keys that derive from baseSpacing via a custom formula (not pure φ power)

/** Tight button-gap: round((base × φ) / 2), minimum 2 */
export function deriveTightGap(base: number): number {
  return Math.max(2, Math.round((base * PHI) / 2));
}

export const CUSTOM_DERIVED_KEYS = new Set([
  "toolbarButtonGap",
  "topBarButtonGap",
]);

export function computeCustomDerived(key: string, base: number): number {
  if (key === "toolbarButtonGap" || key === "topBarButtonGap") {
    return deriveTightGap(base);
  }
  return 0;
}

// ─── Device-specific spacing configurations ──────────────────────────────────

export const DEVICE_SPACING = {
  mobile: {
    padding: GOLDEN_SCALE.sm,       // 13px
    topMargin: GOLDEN_SCALE.md,     // 21px
    panelOffset: GOLDEN_SCALE.sm,   // 13px
    contentGap: GOLDEN_SCALE.xs,    // 8px
  },
  tablet: {
    padding: GOLDEN_SCALE.md,       // 21px
    topMargin: GOLDEN_SCALE.lg,     // 34px
    panelOffset: GOLDEN_SCALE.md,   // 21px
    contentGap: GOLDEN_SCALE.sm,    // 13px
  },
  desktop: {
    padding: GOLDEN_SCALE.lg,       // 34px
    topMargin: GOLDEN_SCALE.xl,     // 55px
    panelOffset: GOLDEN_SCALE.lg,   // 34px
    contentGap: GOLDEN_SCALE.md,    // 21px
  },
} as const;

export const GOLDEN_CLASSES = {
  paddingX: "px-[13px] md:px-[21px] lg:px-[34px]",
  paddingY: "py-[21px] md:py-[34px] lg:py-[55px]",
  topMargin: "pt-[55px] md:pt-[55px] lg:pt-[89px]",
  gap: "gap-[8px] md:gap-[13px] lg:gap-[21px]",
} as const;
