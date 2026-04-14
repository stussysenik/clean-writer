## Context

Three deferred items from the sidebar-feedback-rail session need to land. They share a single theme — polishing the editor render surface — but each touches a different subsystem:

| Item | Subsystem | Blast radius |
|------|-----------|--------------|
| Emoji shortcode display | Typewriter backdrop | Small — pure render transform, no state entanglement |
| Mode selection parity | Typewriter selection overlay | Moderate — duplicates mode layout rules |
| Word count quick tool | Toolbar ActionButtons tooltip | Tiny — tooltip content only |

Bundling them into one proposal lets review cover the shared editor context once. Tasks are ordered so each capability is its own commit during apply, and they can be reviewed independently.

## Goals / Non-Goals

**Goals**
- Shortcode transform is symmetric to the existing `showUtfEmojiCodes` path: persisted toggle, backdrop-only, content unchanged.
- Persisted selection overlay visually lines up with the backdrop in every mode Writing/Song/Code.
- Writers can see total document counts without opening the sidebar.

**Non-Goals**
- No mutation of `content` by the shortcode transform. Cursor, undo, selection persistence stay untouched.
- No unification of hover models between default mode (`hoveredCategory`) and song mode (`hoveredRhymeKey`). They remain separate.
- No refactor of the Typewriter render pipeline into a shared mode-layout primitive. The fix duplicates layout rules inline; a future refactor is noted but out of scope.
- No new toolbar button for counts. No persistent footer pill. The quick tool reuses the existing chars button.

## Decisions

### D1 — Shortcode data is a hand-rolled Map, not a library

**Decision:** Ship `utils/emojiShortcodes.ts` exporting a `Map<string, string>` of ~100 popular shortcodes (faces, hands, weather, hearts, common symbols).

**Alternatives considered:**
- `node-emoji` (~1,600 entries, ~100KB minified). Rejected: bundle cost for an MVP; offline-first PWA already guards against passing dependencies lightly.
- `emojibase-data/en/shortcodes/*.json` tree-shakable subsets. Rejected for the same reason plus the added complexity of a tree-shake config.
- Single-file generated map from `emojibase` at build time. Rejected: more machinery than a hand-rolled map earns at this coverage.

**Why:** A hand-rolled map is small, offline-safe, and trivially extensible. If the user later reports missing shortcodes we swap the implementation without changing the spec contract.

### D2 — Shortcode transform is backdrop-only, `content` is never mutated

**Decision:** Apply the shortcode→emoji substitution inside `renderHighlightsForText` (and the strikethrough branch), using the same chunk-level rewrite pattern that `showUtfEmojiCodes` uses (`Typewriter.tsx:513-534`). The textarea keeps the raw `:smile:` text, the backdrop paints `😀` at the first cell of the shortcode.

**Alternatives considered:**
- Mutate `content` on keystroke: complex — requires cursor arithmetic, undo stack handling, IME safety. Rejected as over-scope for an MVP.
- Replace on blur only: inconsistent with the real-time aesthetic of the app and awkward for users skimming what they just typed.

**Tradeoff we accept:** Text-width divergence between backdrop (short) and textarea (long) means the glyph sits roughly where the first character of the shortcode is in the textarea. This mirrors the inverse misalignment already tolerated in the UTF-code path and matches user expectations for a display-only toggle.

### D3 — Shortcode toggle is mutually exclusive with UTF code toggle

**Decision:** Enabling `emojiShortcodesEnabled` automatically disables `utf8DisplayEnabled`, and vice versa. Enforced in `App.tsx` setters.

**Why:** Combining them produces absurd output (`:smile:` → `😀` → `U+1F600`). Both toggles sit together in the ThemeCustomizer, labelled as a two-option group so the mutual exclusivity is discoverable.

**Override path:** If the user wants both on independently, flip the setter logic — it is a one-line change.

### D4 — Selection overlay mirrors mode layout inline, no shared primitive

**Decision:** The selection overlay renderer (`Typewriter.tsx:1367-1402`) branches on `codeMode` and `songMode` and reproduces the minimum layout rules needed for glyph alignment:

- **Code mode branch:** Prepends a `2.5em` wide `inline-block` spacer for each line to match the Shiki line-number column, then renders the content with the same `whiteSpace: pre-wrap` and monospace metrics.
- **Song mode branch:** Tokenises the selected slice on whitespace, wraps each non-whitespace token in a shell with the same `padding: 1px 6px`, `borderRadius: 4px`, and `fontWeight: 700` that `renderSongHighlights` uses for rhyme-colored words — but only when that token sits inside a rhyme group. `color: transparent` hides the text, the selection background paints through.
- **Default branch:** Unchanged from today.

**Alternatives considered:**
- Extract a shared "layout primitive" that both backdrop and overlay consume. Rejected: touches every render path and bloats this change. Noted as a future follow-up.
- Render the selection overlay via the same `renderContentWithMarkdown` → `renderHighlightsForText` chain, then apply `color: transparent`. Rejected: the backdrop already includes POS coloring / strikethrough / headings / todos that would have to be selectively disabled, and the overlay only needs geometric parity, not styling parity.

**Tradeoff we accept:** Duplication of layout rules. Any future change to song/code backdrop geometry must also update the overlay branch. Tasks.md includes a non-regression scenario to catch drift; long-term, the shared primitive is the right answer and is recorded as a follow-up in this design.

### D5 — Quick tool extends the existing chars button tooltip

**Decision:** `components/Toolbar/ActionButtons.tsx:209-215` already renders the chars button with a tooltip that says "Show/Hide character counts per paragraph". Enrich the tooltip body to include a second line: `{wordCount} words · {charCount} characters`. When a selection is active, the tooltip shows both selection and total counts. The button label still shows selection counts when present and the "Chars" fallback otherwise.

**Alternatives considered:**
- New dedicated "counts" button with a hover popover. Rejected: adds chrome that conflicts with the no-overlap philosophy from the feedback-rail change.
- Persistent footer pill showing totals. Rejected: constant visual weight in the writing area.
- Keyboard shortcut that flashes counts in a toast. Rejected: ephemeral, fails discoverability.

**Why:** Writers already look at the chars button for count info. Tooltip is the lowest-chrome surface that respects the calm-editor aesthetic. No new state, no new props beyond what the button already receives.

## Risks / Open Questions

See `proposal.md` → "Open Questions" (OQ1–OQ4). Summary:

- **OQ1** (mutual exclusivity) — default resolved in D3, reversible.
- **OQ2** (shortcode coverage) — default resolved in D1, swap path documented.
- **OQ3** (quick tool shape) — default resolved in D5, alternative designs listed above.
- **OQ4** (selection parity scope) — default: persisted overlay only, live textarea selection is not in scope because `selection:text-transparent` hides it by design.

Additional risks:

- **R1 — Code mode selection drift on long lines.** If a code line wraps, the `2.5em` line-number column is only prepended once per line but wrapping adds visual lines. Test with a synthetic long-line code block. Mitigation: `white-space: pre-wrap` is already used and matches the backdrop, but verify visually.
- **R2 — Song mode rhyme shell padding on selection start/end boundaries.** If a selection starts mid-rhyme-word, the shell padding may visually clip. Mitigation: accept the minor clipping for MVP; it still clearly communicates the selection range.
- **R3 — Bundle size for shortcode map.** Hand-rolled map stays under 4KB gzipped; measurable via `npm run build` and comparing `dist/assets/*.js` sizes before/after.

## Migration Plan

All three capabilities are additive or visual-only; no migration is required.

- **Emoji shortcode:** `emojiShortcodesEnabled` defaults to `false`. Existing users see no change until they opt in.
- **Selection parity:** Pure bug fix — existing users see a correctly aligned selection box where one was broken.
- **Quick tool:** Tooltip content change — no schema, no storage, no backward compatibility concerns.

## Open Follow-Ups (Out of Scope)

- Extract a `ModeLayoutPrimitive` that backdrop + selection overlay both consume, eliminating the duplication from D4.
- Expand shortcode coverage by swapping to `node-emoji` under the same spec contract.
- Unify the hover models (`hoveredCategory` + `hoveredRhymeKey`) so glow works in song mode for POS categories.
