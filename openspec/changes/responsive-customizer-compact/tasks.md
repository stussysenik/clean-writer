## 1. Reorder Customizer Sections

- [x] 1.1 Move Visible Presets section to be the first content section after the header in ThemeCustomizer/index.tsx
- [x] 1.2 Verify section order: Visible Presets → Font → Base Colors → Word Type Colors → Save as Palette → Reset

## 2. Collapsible Font Section

- [x] 2.1 Add `isFontExpanded` state (default: false) to ThemeCustomizer
- [x] 2.2 When collapsed, render only the selected font row (name + preview text) with a chevron indicator
- [x] 2.3 When expanded, render all 6 font options (existing layout)
- [x] 2.4 Tap the collapsed row or chevron toggles expand/collapse

## 3. Compact Color Row Component

- [x] 3.1 Create `CompactColorRow` component: `[LABEL] [color-well 32×32] [hex-input] [reset-icon]` — single row, ≤44px height
- [x] 3.2 Remove preset swatch buttons from the compact row (color well opens native picker directly)
- [x] 3.3 Replace existing `ColorRow` usage for Background, Text, Cursor with `CompactColorRow`

## 4. Compact Word Type Color Grid

- [x] 4.1 Replace the single-column word type color list with a 3-column grid layout
- [x] 4.2 Each grid cell: colored dot (12px) + truncated label + color well (28×28px)
- [x] 4.3 Tap color well opens native color picker; long-press or secondary action for hex input
- [x] 4.4 Grid uses `grid-cols-3 gap-2` on mobile, adapts on wider viewports

## 5. Fluid Editor Typography

- [x] 5.1 Replace `fontSize: isMobile ? 18 : 24` in App.tsx with CSS `clamp(18px, 2.5vw, 24px)` passed as fontSize
- [x] 5.2 Update Typewriter.tsx textarea and backdrop to use the clamp-based font size
- [x] 5.3 Remove the `useResponsiveBreakpoint` dependency for font-size switching (keep hook for panel paradigm)

## 6. iPad Intermediate Spacing

- [x] 6.1 Verify Typewriter.tsx padding uses `px-[13px] md:px-[21px] lg:px-[34px]` (already exists per golden spacing)
- [x] 6.2 Verify App.tsx top margin uses `pt-[55px] md:pt-[55px] lg:pt-[89px]` (already exists)
- [x] 6.3 Ensure DesktopSyntaxPanel positioning uses golden-proportional offsets at each breakpoint

## 7. E2E Tests & Visual Verification

- [x] 7.1 Run existing syntax-analysis tests to verify no regressions
- [x] 7.2 Add test: customizer scrollHeight ≤ 1.5× clientHeight on 390×844 viewport
- [x] 7.3 Add test: "Visible Presets" heading is the first section heading after "Customize Theme"
- [x] 7.4 Add test: font section collapsed by default, expands on click
- [x] 7.5 Chrome DevTools: take mobile screenshot of compact customizer, verify ≤2 scrolls
- [x] 7.6 Chrome DevTools: verify iPad Pro proportional spacing and font size (~21px)
- [x] 7.7 Run full E2E suite across all device profiles
