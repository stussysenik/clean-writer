## Tasks

### Task 1: Fix syntax data replacement (remove merge accumulation)
**File**: `App.tsx`
**Change**: Replace `updateSyntaxData` merge function (lines 689-737) with direct `setSyntaxData(result)` call. Remove the `updateSyntaxData` helper entirely.
**Spec**: occurrence-word-counts > Syntax data replaces on each analysis
**Test**: E2E test that types text, clears, types new text, verifies old words gone from breakdown

- [x] Replace `updateSyntaxData(result)` with `setSyntaxData(result)` in the useEffect (line 745)
- [x] Remove `updateSyntaxData` helper function (lines 689-737)
- [x] Verify clear button handler already resets syntaxData (it does - line 774)

### Task 2: Add occurrence-based word type counting
**File**: `services/localSyntaxService.ts`
**Change**: Add `getWordTypeOccurrences(content, syntaxSets)` function that counts how many times each classified word appears in the content text.
**Spec**: occurrence-word-counts > Word type counts reflect occurrences
**Test**: Unit-style E2E test with known sentences

- [x] Add `getWordTypeOccurrences(content: string, syntaxSets: SyntaxSets): Record<string, number>` function
- [x] Tokenize content using word boundary regex (matching countWords logic)
- [x] For each token, check membership in each syntax Set (O(1) per lookup)
- [x] Return occurrence counts per type
- [x] Update worker to export the same function signature if needed (not needed - function lives in service layer, not worker)

### Task 3: Wire occurrence counts into PanelBody
**File**: `components/UnifiedSyntaxPanel/PanelBody.tsx`
**Change**: Replace `getWordTypeCounts(syntaxData)` with `getWordTypeOccurrences(content, syntaxSets)`. Pass `content` and `syntaxSets` as props.
**Spec**: enhanced-syntax-highlighting > Word type breakdown display
**Test**: E2E test verifying breakdown numbers match expected occurrences

- [x] Add `content: string` and `syntaxSets: SyntaxSets` props to PanelBody
- [x] Replace `useMemo(() => getWordTypeCounts(syntaxData))` with `useMemo(() => getWordTypeOccurrences(content, syntaxSets))`
- [x] Update UnifiedSyntaxPanel/index.tsx to pass content and syntaxSets through
- [x] Update DesktopSyntaxPanel to pass content and syntaxSets through
- [x] Update App.tsx to pass syntaxSets to UnifiedSyntaxPanel

### Task 4: Add palette average color utility
**File**: `utils/colorContrast.ts` (add to existing)
**Change**: Add `averageHighlightColor(theme: RisoTheme): string` that computes RGB average of all 9 highlight colors.
**Spec**: palette-average-color > Custom palette swatch shows average
**Test**: Unit-style test with known theme colors

- [x] Add `averageHighlightColor(theme: RisoTheme): string` to colorContrast.ts
- [x] Parse each of the 9 highlight hex colors to RGB
- [x] Average R, G, B independently
- [x] Return as hex string

### Task 5: Use average color in ThemeSelector palette swatch
**File**: `components/Toolbar/ThemeSelector.tsx`
**Change**: Replace `palette.overrides.background || baseTheme.accent` with `averageHighlightColor(resolvedTheme)` for custom palette swatch backgroundColor.
**Spec**: palette-average-color > Custom palette swatch shows average
**Test**: Visual E2E test + Chrome DevTools verification

- [x] Import `averageHighlightColor` from utils
- [x] Import `applyPalette` logic or resolve theme inline
- [x] Compute resolved theme (base + overrides) for each palette
- [x] Use `averageHighlightColor(resolvedTheme)` as swatch backgroundColor

### Task 6: Settings gear toggle + z-index fix
**File**: `App.tsx`
**Change**: Change gear onClick to toggle, add z-index elevation when customizer open
**Spec**: occurrence-word-counts > Settings gear icon toggles
**Test**: E2E test opening/closing via gear icon

- [x] Change `onClick={() => setIsCustomizerOpen(true)}` to `onClick={() => setIsCustomizerOpen(prev => !prev)}`
- [x] Add conditional z-index: when `isCustomizerOpen`, gear gets `z-[102]`
- [x] Add visual rotation transform on gear when open (45deg or 90deg)
- [x] Verify touch target remains 44px minimum (TouchButton enforces min-w-[44px] min-h-[44px])

### Task 7: Update E2E tests
**Files**: `tests/e2e/syntax-analysis.spec.ts`, new test file if needed
**Change**: Add tests for occurrence counting, data replacement, gear toggle
**Spec**: All specs
**Test**: All tests pass

- [x] Add test: type text, verify breakdown counts match occurrences
- [x] Add test: type text, clear, type new text, verify old words gone
- [x] Add test: gear icon opens and closes customizer
- [ ] Add test: custom palette swatch displays a color (visual regression)
- [x] Run full test suite and fix any regressions

### Task 8: Chrome DevTools verification
**Change**: Visual verification using Chrome DevTools MCP
**Test**: Screenshot comparison, console error check

- [x] Take screenshot of word count breakdown with known text
- [x] Verify breakdown numbers visually match expected
- [x] Check console for errors
- [x] Verify gear toggle works on mobile viewport
- [ ] Verify custom palette swatch color
