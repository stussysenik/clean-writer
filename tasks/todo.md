# Theme Customizer Simplification

## Context
The current themes tab over-engineered things by trying to expand each row to show the full edit panel inline. Per user feedback: the row expansion is too busy and we should compartmentalize differently — closer to iA Writer / Notion clarity. The polished `ActiveThemeHeader` (Sepia screenshot) is the reference for how the rest should feel.

## Decision
- **One column** for the theme list (display + drag-reorder + visibility only)
- **Two clean compartments below the list**:
  1. **Words** — Background / Text / Cursor + the 12-cell syntax color grid
  2. **Songs** — preset palette strip + the 8 rhyme color pickers
- No per-row expansion. No `WordColorGrid` cluttering each row. The `ActiveThemeHeader` already shows the active theme's full color preview.

## Plan
- [x] **1. Revert expansion mechanism** in `SortableThemeItem` — remove `isExpanded` / `expandedContent` props and the inline reveal block
- [x] **2. Simplify each theme row** — keep only drag handle, visibility checkbox, single accent dot, name, delete (custom only). Strip the dot grid.
- [x] **3. Simplify custom theme rows** to match
- [x] **4. Remove expansion props** from `ThemesTab` interface
- [x] **5. Restore flat Words + Songs compartments** in the themes tab body, but with iA Writer / Notion restraint
- [x] **6. Verify** tsc + build pass with no new errors

## Files Touched
- `components/ThemeCustomizer/index.tsx` — the only file that changed
- `tasks/todo.md` — this plan
- `.impeccable.md` — design context (created earlier)

## Review

### What changed
- **Theme rows are one column now**: drag → visibility → accent dot → name → (edit indicator) → delete. The 12-cell `WordColorGrid` per row is gone — visual noise removed.
- **Active row gets a quiet accent rail**: `${theme.accent}10` background + 600-weight name. Theme-fluid via `theme.text` and `theme.accent`, no hardcoded colors.
- **Hover states are explicit** (mouseEnter/Leave) so the active background isn't fighting Tailwind's `hover:bg-current/5`.
- **Edits indicator** is a 5px dot at 60% accent — the quietest possible signal that a preset has been customized.
- **Three flat compartments below the list**:
  1. Theme picker
  2. **Words** — Background / Text / Cursor (CompactColorRow) + 12-cell syntax color grid, separated by a `border-t` at 8% opacity
  3. **Songs** — preset palette strip + 8 rhyme color rows
- Section headers use the existing `SectionLabel` (10px caps, 0.15em tracking, 40% opacity) — editorial restraint, no decoration.
- **Removed dead code**: `WordColorGrid` (~80 LOC), `averageHighlightColor` (~15 LOC), `SYNTAX_GROUPS` constant, `InlineSection` component, the `expandedThemeId` / `expandedContent` prop wiring.
- **Visibility checkbox** now uses `theme.accent` instead of hardcoded `#198038` green — fully theme-fluid.

### Verification
- `npx tsc --noEmit` — only 8 pre-existing errors in `hooks/useVirtualKeyboard.ts` and `stories/*` (none from this change)
- `npm run build` — clean build, 4.09s, no new warnings
- File length down from 1696 → ~1500 LOC after dead-code removal

### What stays the same
- `ActiveThemeHeader` polish from the previous round — Sepia screenshot is the reference and it still looks correct
- `SyntaxColorEditGrid` justifyItems fix (no oversized "Pre" dot)
- All existing IDs (`theme-color-${key}`, `rhyme-color-${index}`) preserved so the header's jump-to-color still works
