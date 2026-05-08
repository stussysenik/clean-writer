# Unstylized Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Plain" toggle that switches the editor to a Notepad aesthetic (monospace, white bg, black text) with subtle gray underlines for syntax matches.

**Architecture:** New boolean state `unstylizedMode` in App.tsx, passed as prop through Toolbar and Typewriter. Typewriter conditionally renders plain styling in `renderHighlightsForText()` and `renderContentWithMarkdown()`. Toolbar buttons reordered into logical groups.

**Tech Stack:** React, TypeScript, localStorage, inline styles

---

### Task 1: Add IconPlainText to Icons

**Files:**
- Modify: `components/Toolbar/Icons/index.tsx`

- [ ] **Step 1: Add the IconPlainText component**

Add after the `IconFocus` component (line 191) in `components/Toolbar/Icons/index.tsx`:

```tsx
// Plain text mode icon — monospace "T" for raw text
export const IconPlainText = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);
```

- [ ] **Step 2: Verify the app still builds**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/Toolbar/Icons/index.tsx
git commit -m "feat: add IconPlainText icon for unstylized mode"
```

---

### Task 2: Add unstylizedMode state to App.tsx

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Add state declaration**

After the `codeLanguage` state (around line 334), add:

```tsx
const [unstylizedMode, setUnstylizedMode] = useState(() => {
  try {
    return localStorage.getItem("clean_writer_unstylized_mode") === "true";
  } catch {
    return false;
  }
});
```

- [ ] **Step 2: Add persistence effect**

After the `viewMode` persistence effect (around line 699), add:

```tsx
useEffect(() => {
  try {
    localStorage.setItem("clean_writer_unstylized_mode", String(unstylizedMode));
  } catch (e) {
    console.warn("Could not save unstylized mode");
  }
}, [unstylizedMode]);
```

- [ ] **Step 3: Add toggle handler with mutual exclusivity**

After the `toggleViewMode` function (around line 938), add:

```tsx
const toggleUnstylizedMode = useCallback(() => {
  setUnstylizedMode((prev) => {
    if (!prev) {
      // Entering plain mode — disable song and code modes
      setSongMode(false);
      setCodeMode(false);
    }
    return !prev;
  });
}, []);
```

- [ ] **Step 4: Pass unstylizedMode to Typewriter**

In the `<Typewriter>` JSX (around line 1294), add after `codeLanguage={codeLanguage}`:

```tsx
unstylizedMode={unstylizedMode}
```

- [ ] **Step 5: Pass unstylizedMode to Toolbar**

In the `<Toolbar>` JSX (around line 1394), add after `onCycleFocusMode={cycleFocusMode}`:

```tsx
unstylizedMode={unstylizedMode}
onToggleUnstylized={toggleUnstylizedMode}
```

- [ ] **Step 6: Override root container background when unstylized**

At the root `<div>` (line 1009), change the backgroundColor:

```tsx
backgroundColor: unstylizedMode ? "#FFFFFF" : (isMobile ? mobileBackground : currentTheme.background),
```

- [ ] **Step 7: Hide background texture when unstylized**

At the texture div (line 1017), add a conditional opacity:

```tsx
className={`absolute inset-0 pointer-events-none ${unstylizedMode ? 'opacity-0' : 'opacity-20'} mix-blend-multiply z-0`}
```

- [ ] **Step 8: Verify the app still builds**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds (TypeScript will complain about missing props — that's expected, we'll fix in next tasks)

- [ ] **Step 9: Commit**

```bash
git add App.tsx
git commit -m "feat: add unstylizedMode state with persistence and mutual exclusivity"
```

---

### Task 3: Wire Toolbar props and add Plain button with reordering

**Files:**
- Modify: `components/Toolbar/index.tsx`
- Modify: `components/Toolbar/ActionButtons.tsx`

- [ ] **Step 1: Update Toolbar interface and pass-through**

In `components/Toolbar/index.tsx`, add to the `ToolbarProps` interface (after `onCycleFocusMode`):

```tsx
unstylizedMode: boolean;
onToggleUnstylized: () => void;
```

Add to the destructured props of the `Toolbar` component:

```tsx
unstylizedMode,
onToggleUnstylized,
```

Pass to `<ActionButtons>`:

```tsx
unstylizedMode={unstylizedMode}
onToggleUnstylized={onToggleUnstylized}
```

- [ ] **Step 2: Update ActionButtons interface**

In `components/Toolbar/ActionButtons.tsx`, add to the `ActionButtonsProps` interface:

```tsx
unstylizedMode: boolean;
onToggleUnstylized: () => void;
```

Add the import for `IconPlainText`:

```tsx
import {
  IconEyeOpen,
  IconEyeClosed,
  IconStrike,
  IconDownload,
  IconTrash,
  IconMagicClean,
  IconSample,
  IconFocus,
  IconPlainText,
} from "./Icons";
```

Add to the destructured props:

```tsx
unstylizedMode,
onToggleUnstylized,
```

- [ ] **Step 3: Reorder buttons and add Plain button**

Replace the entire button rendering block inside the `<div>` (lines 127-202) with this reordered layout:

```tsx
{/* View modes group */}
<ActionButton
  onClick={onToggleView}
  icon={viewMode === "write" ? <IconEyeOpen /> : <IconEyeClosed />}
  label={viewMode === "write" ? "Preview" : "Edit"}
  tooltip={viewMode === "write" ? "Preview markdown" : "Back to editing"}
  shortcut={mod ? `${mod}P` : undefined}
  ariaLabel={
    viewMode === "write" ? "Preview markdown" : "Switch to edit mode"
  }
/>

<ActionButton
  onClick={onToggleUnstylized}
  active={unstylizedMode}
  icon={<IconPlainText />}
  label="Plain"
  tooltip={unstylizedMode ? "Exit plain text mode" : "Plain text mode — monospace, no colors"}
  shortcut={mod ? `${mod}U` : undefined}
  ariaLabel={unstylizedMode ? "Exit plain text mode" : "Enter plain text mode"}
  className={unstylizedMode ? "!opacity-100" : ""}
  style={unstylizedMode ? { color: theme.accent } : undefined}
  data-testid="unstylized-mode-btn"
/>

{/* Edit tools group */}
<ActionButton
  onClick={onStrikethrough}
  onMouseDown={(e) => e.preventDefault()}
  onPointerDown={onStrikethroughPointerDown}
  onTouchStart={onStrikethroughPointerDown}
  disabled={viewMode === "preview"}
  icon={<IconStrike />}
  label="Strike"
  tooltip="Apply strikethrough to selected text"
  shortcut={mod ? `${mod}X` : undefined}
  ariaLabel="Strikethrough selected text"
  data-testid="strikethrough-btn"
/>

<ActionButton
  onClick={onCleanStrikethroughs}
  disabled={!hasStrikethroughs}
  icon={<IconMagicClean />}
  label="Clean"
  tooltip="Remove all ~~...~~ segments"
  shortcut={mod ? `${mod}K` : undefined}
  ariaLabel="Remove all struck text segments"
  data-testid="clean-strikethroughs-btn"
/>

{/* Navigation group */}
<ActionButton
  onClick={onCycleFocusMode}
  active={focusMode !== "none"}
  disabled={viewMode === "preview"}
  icon={<IconFocus />}
  label={FOCUS_MODE_LABELS[focusMode]}
  tooltip={focusMode === "none" ? "Focus mode (click to cycle)" : `Focus: ${focusMode} — ←/→ navigate, ↑/↓ change level`}
  shortcut={mod ? `${mod}F` : undefined}
  ariaLabel="Cycle focus mode"
  className={focusMode !== "none" ? "!opacity-100" : ""}
  style={focusMode !== "none" ? { color: theme.accent } : undefined}
/>

{/* File ops group */}
<ActionButton
  onClick={onExport}
  icon={<IconDownload />}
  label="Export"
  tooltip="Download as markdown file"
  shortcut={mod ? `${mod}E` : undefined}
  ariaLabel="Export markdown file"
/>

{onSampleText && (
  <ActionButton
    onClick={onSampleText}
    icon={<IconSample />}
    label="Sample"
    tooltip="Load sample text"
    ariaLabel="Load sample text"
  />
)}

<ActionButton
  onClick={onClear}
  icon={<IconTrash />}
  label="Clear"
  tooltip="Clear all content"
  ariaLabel="Clear all content"
  className="hover:text-red-500"
/>
```

- [ ] **Step 4: Verify the app builds and toolbar renders**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/Toolbar/index.tsx components/Toolbar/ActionButtons.tsx
git commit -m "feat: add Plain button to toolbar with logical button reordering"
```

---

### Task 4: Implement unstylized rendering in Typewriter.tsx

**Files:**
- Modify: `components/Typewriter.tsx`

- [ ] **Step 1: Add unstylizedMode prop to interface**

In the `TypewriterProps` interface (around line 52), add after `codeLanguage`:

```tsx
unstylizedMode?: boolean;
```

Add to the component destructuring (scan for where props are destructured):

```tsx
unstylizedMode = false,
```

- [ ] **Step 2: Override backdrop font and color**

At the backdrop div style (line 1179-1188), update fontFamily and color:

```tsx
style={{
  fontFamily: unstylizedMode
    ? "'Courier New', Courier, monospace"
    : codeMode
      ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
      : fontFamily,
  fontSize,
  lineHeight: effectiveLineHeight,
  letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
  color: unstylizedMode ? "#000000" : theme.text,
  paddingLeft: `${paddingLeft}px`,
  paddingRight: `${paddingRight}px`,
  transition: "padding-left 200ms ease, padding-right 200ms ease",
}}
```

- [ ] **Step 3: Override rendering conditional**

At line 1190, update the render conditional to bypass song/code modes when unstylized:

```tsx
{unstylizedMode
  ? renderHighlights()
  : codeMode
    ? renderCodeMode()
    : songMode && songData
      ? renderSongHighlights()
      : renderHighlights()}
```

- [ ] **Step 4: Update renderHighlightsForText for unstylized mode**

In `renderHighlightsForText` (starts at line 495), update the strikethrough styling (lines 511-516):

```tsx
style={{
  textDecoration: "line-through",
  opacity: 0.5,
  textDecorationThickness: "2px",
  textDecorationColor: unstylizedMode ? "#000000" : theme.strikethrough,
  transition: "color 0.3s ease, text-shadow 0.3s ease",
}}
```

Then update the syntax match styling (lines 660-670). Replace the style object:

```tsx
const style: React.CSSProperties = unstylizedMode
  ? {
      color: "#000000",
      fontWeight: "inherit",
      borderBottom: isMatch ? "1px solid #999" : "none",
      transition: "color 0.3s ease",
    }
  : {
      color: isMatch ? color : theme.text,
      fontWeight: isMatch ? 700 : "inherit",
      textShadow: shouldGlow
        ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}80`
        : theme.id === "blueprint" && isMatch
          ? `0 0 1px ${color}`
          : "none",
      transition:
        "color 0.3s ease, text-shadow 0.3s ease, font-weight 0.3s ease",
    };
```

Add `unstylizedMode` to the useCallback dependency array (line 686):

```tsx
}, [
  syntaxSets,
  theme,
  highlightConfig,
  hoveredCategory,
  showUtfEmojiCodes,
  unstylizedMode,
]);
```

- [ ] **Step 5: Update renderContentWithMarkdown for unstylized mode**

In `renderContentWithMarkdown`, update the fenced code block rendering (around line 722-770). Wrap the existing styled code block rendering with an unstylized check:

```tsx
if (blockMatch) {
  const lang = blockMatch[1] || "text";
  const code = blockMatch[2];

  if (unstylizedMode) {
    // Plain text rendering for code blocks
    return (
      <span key={`code-${segIdx}`} style={{ display: "block", whiteSpace: "pre" }}>
        {`\`\`\`${lang}\n${code}\`\`\``}
      </span>
    );
  }

  // ... existing code block rendering stays unchanged
```

Update the heading rendering (around line 819-836). Wrap with unstylized check:

```tsx
if (headingMatch) {
  flushRegular(true);
  const level = headingMatch[1].length as 1 | 2 | 3 | 4;
  const hashes = headingMatch[1];
  const headingText = headingMatch[2];

  if (unstylizedMode) {
    // Plain text — no size/weight changes
    elements.push(
      <React.Fragment key={`h-${segIdx}-${i}`}>
        <span>{hashes} {headingText}</span>
        {!isLast && "\n"}
      </React.Fragment>,
    );
    charOffset += line.length + (isLast ? 0 : 1);
    continue;
  }

  const style = headingSizes[level];
  // ... existing heading rendering stays unchanged
```

Update the todo rendering (around line 843). Wrap with unstylized check:

```tsx
if (todoMatch) {
  flushRegular(true);
  const isChecked = todoMatch[2].toLowerCase() === "x";
  const todoText = todoMatch[4];
  const checkboxOffset = charOffset + 3;

  if (unstylizedMode) {
    // Plain text — show raw markdown syntax
    elements.push(
      <React.Fragment key={`todo-${segIdx}-${i}`}>
        <span>{line}</span>
        {!isLast && "\n"}
      </React.Fragment>,
    );
    charOffset += line.length + (isLast ? 0 : 1);
    continue;
  }

  // ... existing todo rendering stays unchanged
```

Add `unstylizedMode` to the useCallback dependency array (line 930):

```tsx
[content, setContent, renderHighlightsForText, renderCodeTokens, codeHighlightCache, theme.text, theme.accent, theme.background, unstylizedMode],
```

- [ ] **Step 6: Update textarea layer font**

At the textarea style (scan for the textarea element, around line 1344-1355), update fontFamily:

```tsx
fontFamily: unstylizedMode
  ? "'Courier New', Courier, monospace"
  : codeMode
    ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
    : fontFamily,
```

And update letterSpacing on the textarea to match:

```tsx
letterSpacing: unstylizedMode ? "0px" : effectiveLetterSpacing,
```

- [ ] **Step 7: Update cursor dot color for unstylized mode**

At the cursor dot (around line 1199-1200), update:

```tsx
backgroundColor: unstylizedMode ? "#000000" : lastWordColor,
boxShadow: unstylizedMode ? "none" : `0 0 6px 1px ${lastWordColor}55`,
```

- [ ] **Step 8: Verify the app builds**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 9: Commit**

```bash
git add components/Typewriter.tsx
git commit -m "feat: implement unstylized rendering with monospace, plain colors, and underline hints"
```

---

### Task 5: Add keyboard shortcut

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Find the keyboard shortcut registration**

Search for existing shortcut registrations (e.g. `Cmd+Shift+P` for preview). The app uses `@tanstack/react-hotkeys` based on the commit history. Find where shortcuts are registered and add:

```tsx
// Plain text mode toggle
{ keys: "mod+shift+u", handler: toggleUnstylizedMode }
```

The exact integration depends on how the hotkeys are set up. Match the existing pattern used for `toggleViewMode` (Cmd+Shift+P).

- [ ] **Step 2: Add to Tab-held shortcut overlay**

In App.tsx, find the Tab-held shortcut cheat sheet (around line 1403). Add an entry for the new shortcut:

```tsx
<span>⌘⇧U</span><span>Plain mode</span>
```

Match the existing format of the other shortcut entries.

- [ ] **Step 3: Verify shortcut works**

Run: `npx vite dev`
Open browser, press `Cmd+Shift+U` — should toggle plain mode on/off.

- [ ] **Step 4: Commit**

```bash
git add App.tsx
git commit -m "feat: add Cmd+Shift+U keyboard shortcut for plain mode"
```

---

### Task 6: Visual verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

Run: `npx vite dev`

- [ ] **Step 2: Verify plain mode toggle**

1. Click the "Plain" button in toolbar — editor switches to monospace/white/black
2. Type text with various words — syntax words get gray underlines
3. Verify strikethrough: select text, click Strike — line-through renders in black
4. Click Clean — strikethrough blocks removed
5. Toggle Focus mode — dimming still works
6. Toggle back to normal — all theme styling restores
7. Verify toolbar order: Preview | Plain | Strike | Clean | Focus | Export | (Sample) | Clear

- [ ] **Step 3: Verify persistence**

1. Enable Plain mode
2. Refresh page
3. Plain mode should still be active

- [ ] **Step 4: Verify mutual exclusivity**

1. Open panel, enable Song mode
2. Click Plain button — Song mode should auto-disable
3. Exit Plain mode, enable Code mode
4. Click Plain button — Code mode should auto-disable

- [ ] **Step 5: Verify mobile**

1. Resize to mobile width
2. Toggle Plain mode — should work identically
3. Verify toolbar layout is correct on mobile

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "feat: unstylized mode — complete implementation with toolbar reordering"
```
