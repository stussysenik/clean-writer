# Change: Improve Mobile UX - Keyboard, Selection & Strikethrough

## Why

Mobile users experience unreliable keyboard detection, lost text selection when tapping strikethrough, doubled `~~~~` markers when extending strikethrough ranges, and the word counter panel floating in the middle instead of sticking to the right edge.

## What Changes

- **Keyboard Detection**: Replace unreliable 150px VisualViewport threshold with VirtualKeyboard API (Chrome 94+) and improved VisualViewport fallback
- **Selection Persistence**: Save text selection on `pointerdown`/`touchstart` events before blur occurs on mobile
- **Strikethrough Merge**: Detect and merge adjacent/overlapping strikethrough markers instead of doubling them
- **Word Counter Position**: Fix flexbox order so the syntax panel tab sticks to the right edge of the screen

## Impact

- Affected specs: mobile-input (new capability)
- Affected code:
  - `App.tsx` - Replace keyboard detection, update strikethrough handler
  - `hooks/useVirtualKeyboard.ts` - New hook for keyboard detection
  - `hooks/useSelectionPersistence.ts` - New hook for selection persistence
  - `utils/strikethroughUtils.ts` - New utility for strikethrough merge logic
  - `components/UnifiedSyntaxPanel/index.tsx` - Fix flexbox order
  - `components/Toolbar/ActionButtons.tsx` - Add pointerdown/touchstart handlers
  - `components/Toolbar/index.tsx` - Pass through new props
