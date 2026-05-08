# Unstylized Mode (Plain Text View)

## Problem

The editor's syntax highlighting, colored text, bold weights, glow effects, and themed backgrounds create visual noise when the user wants to focus purely on content. There's no way to strip everything down to a raw, Notepad-like view while keeping essential editing tools (strikethrough, deletion) functional.

## Solution

A "Plain" toggle in the toolbar that switches the editor to a true Notepad aesthetic: monospace font, white background, black text. Syntax-matched words show subtle gray underlines instead of colors, preserving analytical value without visual noise. Strikethrough and focus mode continue to work.

## Behavior

### Visual Changes When Active

| Property | Normal Mode | Plain Mode |
|----------|-------------|------------|
| Font | Theme font (e.g. Georgia) | `'Courier New', Courier, monospace` |
| Background | Theme background (e.g. #f5f0e8) | `#FFFFFF` |
| Text color | Theme text color | `#000000` |
| Syntax highlights | Colored + bold + glow | `borderBottom: 1px solid #999` (gray underline) |
| Markdown headings | Sized + weighted | Plain text, no formatting |
| Code blocks | Shiki syntax colored | Plain monospace text |
| Strikethrough | `line-through` in theme color | `line-through` in black, `opacity: 0.5` |
| Focus mode dimming | Works (theme accent) | Works (gray-scale) |

### Mode Interactions

- **Song mode / Code mode**: auto-disabled when entering Plain mode (mutual exclusivity with visual modes, not with write/preview)
- **Write / Preview**: Plain mode only affects the write view (backdrop rendering). Preview mode uses `MarkdownPreview` which is unaffected. Toggling to preview while in Plain mode shows normal rendered markdown; toggling back returns to Plain write view.
- **Focus mode**: continues to work, dimming via opacity
- **Highlight config**: preserved — toggling categories still controls which words get underlines
- **Panel (syntax/song/code toggles)**: disabled while in Plain mode

### State

- **Type**: `boolean` (`unstylizedMode`)
- **Storage**: `localStorage` key `"clean_writer_unstylized_mode"`
- **Default**: `false`
- **Orthogonal to**: `viewMode` (write/preview)
- **Mutually exclusive with**: `songMode`, `codeMode`

## Toolbar Reorganization

Reorder buttons into logical groups:

```
[ Preview | Plain ]  [ Strike | Clean ]  [ Focus ]  [ Export | Clear ]
  view modes           edit tools          nav         file ops
```

- No visual separators between groups — just logical ordering
- "Plain" button uses a monospace `T` icon (24x24 SVG)
- Active state: accent color + full opacity (same pattern as Focus button)
- Label: "Plain" (inactive) — stays "Plain" when active
- Keyboard shortcut: `Cmd+Shift+U` / `Ctrl+Shift+U`

## Files to Modify

| File | Change |
|------|--------|
| `types.ts` | No changes needed (boolean state, not a new type) |
| `App.tsx` | Add `unstylizedMode` state, persistence, toggle handler, pass as prop |
| `components/Typewriter.tsx` | Accept `unstylizedMode` prop, conditional rendering in `renderHighlightsForText()`, font/color overrides in backdrop + textarea |
| `components/Toolbar/ActionButtons.tsx` | Add Plain button, reorder buttons into groups |
| `components/Toolbar/Icons/index.tsx` | Add `IconPlainText` icon |
| `components/Toolbar/index.tsx` | Pass through `unstylizedMode` and `onToggleUnstylized` props |

## Rendering Changes (Typewriter.tsx)

### Backdrop layer

When `unstylizedMode`:
- `fontFamily: "'Courier New', Courier, monospace"`
- `color: '#000000'`
- Container background override to `#FFFFFF`

### `renderHighlightsForText()`

When `unstylizedMode` and a word matches a syntax category:
- Instead of: `color: theme.highlight[cat]`, `fontWeight: 700`, `textShadow: glow`
- Apply: `borderBottom: '1px solid #999'`, `color: '#000'`, `fontWeight: 'normal'`

### `renderContentWithMarkdown()`

When `unstylizedMode`:
- Headings render as plain text (no size/weight changes)
- Code blocks render as plain monospace (no Shiki coloring)
- Todo checkboxes render as plain text

### Strikethrough

No changes — already handled by regex split in `renderHighlightsForText()`. Just ensure `textDecorationColor` uses `#000` instead of `theme.strikethrough`.

## Verification

1. Toggle Plain mode via toolbar — editor switches to monospace/white/black
2. Type text — syntax words get gray underlines, non-matched words are plain
3. Select text and press Strike — strikethrough renders with line-through
4. Clean button removes strikethrough blocks
5. Toggle Focus mode — dimming works in plain view
6. Toggle back to normal — all theme styling restores, highlight config preserved
7. Enter Plain mode while in Song/Code mode — those modes auto-disable
8. Toolbar buttons are in new grouped order
9. `Cmd+Shift+U` toggles the mode
10. Refresh page — Plain mode state persists from localStorage
