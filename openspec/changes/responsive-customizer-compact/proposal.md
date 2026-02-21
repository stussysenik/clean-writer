## Why

The ThemeCustomizer panel requires 4 full scrolls on mobile (2777px content in 868px viewport). Each of the 12 color sections is laid out vertically with full-width color pickers, and sections are ordered poorly (Visible Presets buried at the bottom). Meanwhile, responsive breakpoints only distinguish desktop (≥1024px) from everything else — iPad Pro, iPhone, and Pixel all get identical treatment despite dramatically different screen real estate.

## What Changes

- **Compact 2D color layout**: Replace vertical color section stacks with a grid/table layout — color well + label on the left, preset swatches in a tight row on the right. Target ≤2 scrolls on mobile.
- **Move Visible Presets to top**: Theme visibility toggles are the most-used quick action — they should be immediately accessible, not buried after 12 color sections.
- **Collapsible font section**: Fonts take 6 full rows. Show only selected font with a tap-to-expand dropdown.
- **Compact word type color grid**: 9 word types in a 3×3 or compact list with inline color wells, not full-width ColorPicker per row.
- **Responsive proportions per device class**: Add intermediate breakpoint behavior so iPad gets proportional spacing between mobile and desktop, not a binary jump.
- **Fluid text scaling**: Use CSS clamp() for key typography sizes instead of discrete 18px→24px jumps.

## Capabilities

### New Capabilities
- `compact-customizer`: Restructured ThemeCustomizer with 2D grid layout, collapsible font picker, reordered sections (presets first), targeting ≤2 scrolls on iPhone
- `responsive-device-scaling`: Device-proportional typography and spacing using CSS clamp() and refined breakpoints for iPhone/iPad/Desktop

### Modified Capabilities
- `enhanced-syntax-highlighting`: Word type color pickers become compact inline wells in the customizer grid

## Impact

- `components/ThemeCustomizer/index.tsx` — Major restructure (reorder sections, compact color grid, collapsible fonts)
- `components/ColorPicker/index.tsx` — Add compact variant for inline use
- `components/ColorPicker/ColorSwatch.tsx` — Smaller mobile size variant
- `App.tsx` — Responsive font-size with clamp(), refined padding breakpoints
- `components/Typewriter.tsx` — Fluid padding/font scaling
- `constants/spacing.ts` — Add fluid spacing utilities
- `components/UnifiedSyntaxPanel/PanelBody.tsx` — Proportional sizing
- `components/Toolbar/index.tsx` — Refined tablet breakpoint behavior
