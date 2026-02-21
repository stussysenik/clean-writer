## Context

Clean Writer uses Compromise.js in a Web Worker for NLP syntax analysis. The current architecture has a critical bug: `updateSyntaxData()` in App.tsx (line 689) merges new analysis results with old via Set union, meaning words from deleted text persist in the breakdown. Additionally, `getWordTypeCounts()` counts unique word types rather than occurrences, so "the the" counts as 1 article, not 2. The total word count uses `Intl.Segmenter` which correctly counts all occurrences.

The custom palette swatch in ThemeSelector shows `palette.overrides.background` or fallback to base accent - not representative of the palette's actual color identity. The settings gear icon only opens the customizer (never closes), creating a UX dead-end where users must tap the backdrop or X button.

## Goals / Non-Goals

**Goals:**
- Word type breakdown sums SHALL equal total word count (invariant)
- Replace syntax data on each analysis (no accumulation)
- Count word occurrences per type, not unique types
- Custom palette swatch shows average of highlight colors
- Settings gear toggles open/close seamlessly
- All changes verified with unit logic + E2E tests

**Non-Goals:**
- Changing the NLP engine or adding new word types
- Redesigning the ThemeCustomizer layout
- Adding new themes or fonts
- Changing the harmonica gesture behavior

## Decisions

### D1: Replace instead of merge syntax data
**Decision**: Change `updateSyntaxData` to `setSyntaxData(result)` directly, removing the Set union merge.

**Rationale**: The merge was originally added to handle incremental typing (typewriter mode appends only). But the Web Worker already re-analyzes the full text on each debounced call. Merging causes stale words to persist forever. Replacing gives accurate-at-all-times data with zero additional cost since the worker already does full analysis.

**Alternative considered**: Diff-based merge (only add/remove changed words). Rejected - unnecessary complexity when worker already returns complete analysis.

### D2: Count occurrences via content scanning
**Decision**: Add `getWordTypeOccurrences(content, syntaxData)` that scans the actual content text and counts how many times each classified word appears. This replaces `getWordTypeCounts()` which only counted unique types.

**Approach**:
1. Tokenize content into words (reuse `Intl.Segmenter` or simple regex split)
2. For each word, check which syntax category it belongs to (using the Sets from syntaxData for O(1) lookup)
3. Increment the count for that category
4. Words not in any category go into an "unclassified" bucket (not displayed but accounts for the sum difference)

**Rationale**: This ensures `sum(type_counts) + unclassified = total_word_count`. The breakdown shows what the NLP engine classified, and the total is always accurate.

**Alternative considered**: Making NLP classify every single word. Rejected - Compromise.js doesn't classify every word (punctuation-like words, numbers, etc.) and forcing 100% classification would require significant NLP customization.

### D3: Average color for palette swatch
**Decision**: Compute a simple RGB average of all 9 highlight colors in the palette. This produces a representative "mood" color for the swatch.

**Approach**: `averageColor(theme) = avg(R), avg(G), avg(B)` across all highlight values. Pure utility function, no side effects, no data mutation.

**Alternative considered**: Weighted average (more weight to noun/verb as dominant types). Rejected - adds complexity, simple average already produces a good representative color.

### D4: Gear icon toggle behavior
**Decision**: Change `onClick={() => setIsCustomizerOpen(true)}` to `onClick={() => setIsCustomizerOpen(prev => !prev)}` and raise the gear's z-index above the customizer backdrop when open.

**Approach**: When customizer is open, the gear icon gets `z-[102]` (above backdrop z-[100] and panel z-[101]). This lets it act as the close button too. The gear visually transforms (rotate 90deg) when open to signal state.

## Risks / Trade-offs

- **[Risk] Unclassified words visible in sum gap** → Show only classified types in breakdown; total word count remains accurate. Users see "7 words" with 6 classified - this is correct behavior since some words (like "how") may span categories or remain unclassified by Compromise.js
- **[Risk] Average color may look muddy for high-contrast palettes** → Acceptable tradeoff; the dashed border already signals "custom palette" visually. The average provides better identity than a single arbitrary color
- **[Risk] Gear toggle z-index could cause touch conflicts on mobile** → Use `pointer-events-none` on the backdrop area under the gear icon, and ensure minimum 44px tap target
