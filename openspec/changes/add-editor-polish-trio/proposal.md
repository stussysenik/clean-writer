## Why

The sidebar-feedback-rail session shipped toolbar a11y and customizer polish, but three follow-ups were pushed back because each deserved its own plan + commit:

1. **Emoji shortcode rendering is missing.** The app already has a `showUtfEmojiCodes` toggle that renders `😀` as `U+1F600` in the backdrop; there is no symmetric feature that lets users type `:smile:` and see `😀`. Writers composing notes in shortcode-style sources (markdown, Slack transcripts, notebooks) currently see raw `:shortcode:` strings.
2. **Persisted selection highlight breaks in song and code modes.** `Typewriter.tsx:1367-1402` renders the selection overlay with raw `content.slice()` and normal-weight spans, but the song-mode backdrop adds `padding: 1px 6px`, `borderRadius`, and `fontWeight: 700` on rhyme tokens (`Typewriter.tsx:1217-1236`), and the code-mode backdrop prepends a `2.5em` line-number column on every line (`Typewriter.tsx:995-1012`). The overlay geometry drifts so the selection box no longer lines up with the glyphs it is meant to highlight.
3. **Total word/character counts are invisible during writing.** `App.tsx:595-596` computes `wordCount` and `totalCharCount` but only threads them into `DocumentSidebar → FeedbackSection` as submission context (`FeedbackSection.tsx:129-130`). The toolbar chars button (`ActionButtons.tsx:211`) shows selection counts only. A writer has no way to see total document counts without opening the sidebar, and even there the numbers are hidden metadata.

Each of the three is user-visible polish on the editor surface. Bundling them into one proposal keeps the review compact; tasks.md orders them so each can land as its own commit during apply.

## What Changes

- **Add shortcode-to-emoji rendering in the backdrop** behind a persisted toggle that mirrors the existing UTF code display pattern. The underlying `content` string is never mutated — only the rendered backdrop substitutes known shortcodes.
- **Make the persisted selection overlay mode-aware** so it respects song-mode rhyme shell geometry (padding, border-radius, bold weight on focused rhymes) and code-mode line-number column width. Default-mode behaviour is unchanged.
- **Surface total word/character counts as a quick tool** by extending the existing chars button tooltip with total document counts, and showing totals alongside selection counts when a selection is active. No new toolbar button, no new state.

## Capabilities

### New Capabilities
- `emoji-shortcode-display` — Backdrop rendering rule that substitutes `:shortcode:` tokens with their emoji glyphs when enabled, persisted across sessions, mutually exclusive with `showUtfEmojiCodes`.
- `mode-selection-parity` — Guarantee that the persisted selection overlay aligns with the backdrop in writing, song, and code modes.
- `word-count-quick-tool` — Discoverable quick-access affordance that exposes total document word and character counts without opening the sidebar.

## Impact

- `utils/emojiShortcodes.ts` — new lookup map of popular shortcodes + transformer helper
- `components/Typewriter.tsx` — apply shortcode transform in `renderHighlightsForText`; rewrite the persisted selection overlay to branch on `codeMode` / `songMode` and mirror the backdrop layout rules
- `components/Toolbar/ActionButtons.tsx` — enrich the chars button tooltip to surface total counts
- `App.tsx` — new state `emojiShortcodesEnabled` with localStorage persistence; pass through to `Typewriter`; ensure mutual exclusivity with `utf8DisplayEnabled`
- `components/ThemeCustomizer/*` — add toggle row for the shortcode display option next to the existing UTF toggle
- `hooks/useSelectionPersistence.ts` — no change expected, but flagged for review since the overlay consumes its output

## Open Questions

Raise before apply if any of the following defaults need to change:

- **OQ1 — Mutual exclusivity.** Default: enabling shortcode display disables UTF-code display and vice versa (they conflict visually — one expands, one contracts). Override if the user wants both on at once.
- **OQ2 — Shortcode coverage.** Default: hand-rolled map of ~100 popular shortcodes (faces, hands, weather, symbols) bundled in `utils/emojiShortcodes.ts`. Override if full `node-emoji` / `emojibase` coverage is required.
- **OQ3 — Quick tool shape.** Default: extend existing chars button tooltip to reveal totals on hover. Override if the user wants a persistent footer pill or a new dedicated counts button.
- **OQ4 — Selection parity scope.** Default: fix only the *persisted* selection overlay (the blur-state highlight). Live textarea selection is hidden by `selection:text-transparent` and is not in scope. Override if live selection should also get a custom visual in song/code modes.
