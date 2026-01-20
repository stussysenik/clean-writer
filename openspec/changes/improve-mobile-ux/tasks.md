# Tasks: Improve Mobile UX

## 1. Create useVirtualKeyboard Hook
- [ ] 1.1 Create `hooks/useVirtualKeyboard.ts` with VirtualKeyboard API support
- [ ] 1.2 Add VisualViewport API fallback with improved threshold logic
- [ ] 1.3 Support reduced motion preference
- [ ] 1.4 Add debouncing for rapid resize events

## 2. Create useSelectionPersistence Hook
- [ ] 2.1 Create `hooks/useSelectionPersistence.ts`
- [ ] 2.2 Save selection on `pointerdown`/`touchstart` (before blur)
- [ ] 2.3 Add `getSavedSelection()` method for retrieving saved range
- [ ] 2.4 Auto-clear after 5 seconds (safety timeout)

## 3. Create Strikethrough Merge Utility
- [ ] 3.1 Create `utils/strikethroughUtils.ts`
- [ ] 3.2 Implement `applyStrikethrough(content, start, end)` with merge logic
- [ ] 3.3 Implement `stripStrikethroughMarkers(text)` helper
- [ ] 3.4 Handle edge cases: adjacent markers, overlapping, nested

## 4. Fix Word Counter Position
- [ ] 4.1 Update `components/UnifiedSyntaxPanel/index.tsx` flexbox order
- [ ] 4.2 Ensure tab sticks to right edge on all screen sizes
- [ ] 4.3 Verify panel slides correctly from the tab

## 5. Integrate Hooks in App.tsx
- [ ] 5.1 Replace old keyboard detection (lines 777-787) with `useVirtualKeyboard`
- [ ] 5.2 Add `useSelectionPersistence` hook
- [ ] 5.3 Update `handleStrikethrough` to use saved selection
- [ ] 5.4 Update `handleStrikethrough` to use merge logic

## 6. Update Toolbar Components
- [ ] 6.1 Add `onPointerDown` prop to ActionButtons.tsx
- [ ] 6.2 Add `onTouchStart` prop to ActionButtons.tsx
- [ ] 6.3 Update Toolbar/index.tsx to pass through new props

## 7. Verification
- [ ] 7.1 Test keyboard detection on iOS Safari
- [ ] 7.2 Test keyboard detection on Chrome Android
- [ ] 7.3 Test selection persistence when tapping strikethrough
- [ ] 7.4 Test strikethrough merge with adjacent markers
- [ ] 7.5 Verify word counter sticks to right edge
