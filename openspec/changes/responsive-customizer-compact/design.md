## Context

The ThemeCustomizer is a right-sliding panel (max-w-md, z-[101]) containing 6 sections stacked vertically: Font (6 options), Base Colors (3 pickers), Word Type Colors (9 pickers), Save as Palette, Visible Presets, and Reset. Each ColorPicker renders a label, 44×44px color well, 8 preset swatches (32×32px each), a hex input, and a reset button — all on one row that wraps. On mobile (390×844), this produces 2777px of content in an 868px viewport (3.2× ratio, ~4 scrolls).

The app uses a single responsive breakpoint at 1024px (desktop vs everything else). Font sizes jump discretely from 18px to 24px. Golden ratio spacing (8/13/21/34/55/89px) is applied but with only `md:` and `lg:` Tailwind variants.

Playwright tests run against 5 device profiles: iPhone 12 (390×664), Pixel 5 (393×727), iPad Pro (1024×1366), Desktop Chrome (1280×720), Desktop Safari (1280×720).

## Goals / Non-Goals

**Goals:**
- Reduce mobile customizer to ≤1.5× viewport height (~2 scrolls max)
- Move Visible Presets section to the top of the customizer
- Compact color pickers into a 2D grid (label + color well + hex on one tight row)
- Collapse font section to show only the selected font with tap-to-expand
- Add CSS clamp()-based fluid typography for the main editor
- Refine spacing proportions for iPad Pro intermediate sizing

**Non-Goals:**
- Complete redesign of the customizer (keep the sliding panel paradigm)
- Changing color picker interaction (keep native color well + presets)
- Adding new themes or color science changes
- Restructuring the main App.tsx layout or Typewriter component architecture
- Changing the golden ratio spacing constants themselves

## Decisions

### D1: Compact ColorRow — inline color well with hidden presets
**Choice**: Replace full ColorPicker with an inline row: `[label] [color-well 32×32] [hex-input] [reset]`. Preset swatches shown on-demand via tap on the color well (toggle expand).
**Why over full ColorPicker always shown**: Each full ColorPicker is ~80px tall with presets. 12 of them = 960px just for colors. Compact rows at ~40px each = 480px. Presets are rarely used (most users use the native color well), so hide-by-default saves 50% vertical space.
**Alternative rejected**: Tabs (Font/Colors/Presets) — adds navigation complexity, hides everything behind a click.

### D2: Section reordering — Presets → Font → Base Colors → Word Types → Save → Reset
**Choice**: Move Visible Presets to the very top, before Font.
**Why**: Toggling theme visibility is the most frequent quick action. Users want to show/hide themes without scrolling past fonts and 12 color pickers. Aligns with the government design system principle of "most-used actions first."

### D3: Collapsible font section — show selected, tap to expand
**Choice**: Default collapsed, showing only the currently selected font in a compact row. Tap expands the full 6-font list.
**Why**: 6 font rows at ~56px each = 336px. Collapsed = ~48px. Saves 288px on mobile. Users change fonts rarely after initial selection.

### D4: Word type colors in a compact grid — 3×3
**Choice**: Render 9 word type colors in a 3-column grid. Each cell: `[colored-dot 12px] [label truncated] [color-well 28px]`. Tap color well opens native picker.
**Why over vertical list**: 9 vertical rows at ~44px = 396px. A 3×3 grid at ~48px per row = 144px. Saves 252px. The dot provides visual identification (matches PanelBody breakdown dots).

### D5: Fluid typography via CSS clamp()
**Choice**: Replace `fontSize: isMobile ? 18 : 24` with `clamp(18px, 2.5vw, 24px)`.
**Why**: Eliminates the jarring 18→24px jump. On iPad Pro (1024px), this yields ~21px — a natural intermediate. On small phones (360px), yields 18px. On wide desktop (1440px), caps at 24px.

### D6: Intermediate iPad spacing
**Choice**: Add `md:` (768px) breakpoint styles between mobile and desktop for padding and panel positioning. Use golden ratio intermediate values: padding 21px at md, 34px at lg.
**Why**: iPad Pro at 1024px currently gets desktop layout but with desktop-sized spacing that can feel cramped. The `md:` breakpoint gives it intermediate proportions.

## Risks / Trade-offs

- **Compact color grid reduces discoverability** → Mitigated by colored dots and the expand-on-tap pattern for presets
- **Collapsible font section hides options** → Mitigated by showing selected font name + preview text in collapsed state
- **clamp() not supported in very old browsers** → 97%+ browser support, graceful degradation via fallback value
- **3×3 word type grid labels may truncate on narrow screens** → Use abbreviations at <360px if needed, or 2-column fallback
