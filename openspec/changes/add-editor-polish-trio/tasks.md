## 1. Emoji Shortcode Display

- [x] 1.1 Add `utils/emojiShortcodes.ts` exporting `EMOJI_SHORTCODES: Map<string, string>` (~100 popular entries) and `replaceShortcodesWithEmoji(text: string): string` that only substitutes known shortcodes
- [x] 1.2 Add `emojiShortcodesEnabled` state to `App.tsx` with localStorage key `clean_writer_emoji_shortcodes_enabled`, mutually exclusive with `utf8DisplayEnabled`
- [x] 1.3 Thread `showEmojiShortcodes` prop through `Typewriter.tsx` and apply `replaceShortcodesWithEmoji` to chunks inside `renderHighlightsForText` (strikethrough + regular branches), mirroring the existing `showUtfEmojiCodes` transform
- [x] 1.4 Add a toggle row in `components/ThemeCustomizer/*` next to the existing UTF-code toggle, labelled so the mutual exclusivity is clear
- [x] 1.5 Verify the underlying `content` string is never mutated (unit test on `setContent` call sites or manual inspection of `onInput` / `onPaste`)
- [x] 1.6 Run `npm run build` and diff `dist/assets/*.js` size against main — the shortcode map must add less than 4KB gzipped

## 2. Mode Selection Parity

- [x] 2.1 Audit `Typewriter.tsx:1367-1402` persisted selection overlay against `renderCodeMode` (`:980-1016`) and `renderSongHighlights` (`:1151-1256`) to enumerate every layout rule that differs
- [x] 2.2 Branch the overlay renderer on `codeMode` and prepend a `2.5em` `inline-block` spacer per line to match the Shiki line-number column
- [x] 2.3 Branch the overlay renderer on `songMode` and wrap rhyme-group tokens in shells with the same `padding: 1px 6px`, `borderRadius: 4px`, and `fontWeight: 700` used by `renderSongHighlights`
- [x] 2.4 Confirm the default branch (writing mode) is unchanged — visual diff against current main
- [ ] 2.5 Manually verify selection alignment in all three modes with short, long, wrapped, and multi-line selections

## 3. Word Count Quick Tool

- [x] 3.1 Extend `components/Toolbar/ActionButtons.tsx:211` chars button to accept `wordCount` and `charCount` props for the full document
- [x] 3.2 Enrich the tooltip content: always include `{wordCount} words · {charCount} characters` as a second line; when a selection is active, show both selection and total counts
- [x] 3.3 Thread `wordCount` / `totalCharCount` from `App.tsx:595-596` through `components/Toolbar/index.tsx` into `ActionButtons`
- [x] 3.4 Confirm `DocumentSidebar/FeedbackSection.tsx` still receives the same counts for submission context (no regression in the feedback pipeline)

## 4. Verification

- [x] 4.1 `npx tsc --noEmit` — clean type check
- [x] 4.2 `npm run build` — successful production build with size check from task 1.6
- [ ] 4.3 Manual smoke test in dev server: shortcode toggle on/off, UTF toggle on/off, confirm mutual exclusivity
- [ ] 4.4 Manual smoke test: select text in writing mode → switch to song mode via customizer → confirm selection overlay aligns with rhyme shells
- [ ] 4.5 Manual smoke test: select text → switch to code mode → confirm selection overlay aligns with line-numbered content
- [ ] 4.6 Manual smoke test: hover the chars button with empty selection, confirm tooltip shows total counts; create a selection, confirm tooltip shows both selection and total counts
- [ ] 4.7 Cypress regression run (`npx cypress run --spec 'cypress/e2e/*.cy.ts'`) to catch any toolbar / overlay regressions

## 5. Commit Plan

- [x] 5.1 Commit capability 1 (emoji shortcodes) as `feat(editor): add :shortcode: emoji display toggle`
- [x] 5.2 Commit capability 2 (selection parity) as `fix(editor): align persisted selection overlay in song and code modes`
- [x] 5.3 Commit capability 3 (quick tool) as `feat(toolbar): surface total counts in chars button tooltip`
- [ ] 5.4 Push main; deploy to Vercel; verify on `clean-writer.mxzou.com`
