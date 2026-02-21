## Why

The word type breakdown counter shows wrong numbers because `updateSyntaxData()` in App.tsx accumulates words from all previous analyses via Set union instead of replacing with current text's analysis. Additionally, `getWordTypeCounts()` counts unique word *types* (e.g., "the" = 1) while `countWords()` counts total *occurrences* (e.g., "the the" = 2), creating a permanent mismatch. Combined with a custom template swatch that shows raw background color instead of a representative average, and a settings gear that can't toggle closed, these create friction that breaks trust in the product's core value prop: seeing your text differently through syntax visualization.

## What Changes

- **Fix word type counting**: Replace syntax data on each analysis instead of merging, and count word *occurrences* per type (not unique types) so breakdown sums match total word count
- **Custom template average color**: Compute average of all highlight colors for the palette swatch circle, preserving palette data integrity
- **Settings gear toggle**: Make gear icon toggle the customizer open/close with proper z-index layering so it's always accessible
- **Color-count sync**: Ensure word type colors in breakdown always derive from single source of truth (`currentTheme.highlight`), and word type counts update reactively with content changes
- **Settings panel legibility**: Ensure all text/controls in ThemeCustomizer are legible against the theme background

## Capabilities

### New Capabilities
- `occurrence-word-counts`: Accurate per-occurrence word type counting that sums to total word count, replacing the unique-types-only approach
- `palette-average-color`: Visual representation of custom palettes using computed average of highlight colors

### Modified Capabilities
- `enhanced-syntax-highlighting`: Word type counting changes from unique types to occurrences; breakdown must sum to total

## Impact

- **Core files**: `App.tsx` (remove merge logic), `services/localSyntaxService.ts` (new occurrence counting), `workers/syntaxWorker.ts` (match service changes)
- **UI files**: `components/UnifiedSyntaxPanel/PanelBody.tsx` (display occurrence counts), `components/Toolbar/ThemeSelector.tsx` (average color swatch), `components/ThemeCustomizer/index.tsx` (no changes needed - colors already reactive)
- **App.tsx gear icon**: Toggle behavior instead of open-only
- **Tests**: `tests/e2e/syntax-analysis.spec.ts` must be updated to verify occurrence counting and sum invariant
- **No breaking API changes** - all changes are internal to the app
