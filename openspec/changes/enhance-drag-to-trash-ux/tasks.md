# Tasks: Enhance Drag-to-Trash UX

## Ordered Implementation Tasks

### Phase 1: Floating Ghost Element
- [ ] **T1.1** Create `DragGhost.tsx` component with portal rendering
- [ ] **T1.2** Add `dragPosition` state tracking (x, y coordinates) to ThemeSelector
- [ ] **T1.3** Implement smooth cursor following with `requestAnimationFrame` and easing
- [ ] **T1.4** Style ghost element: elevated shadow, 80% opacity, scale(1.2)
- [ ] **T1.5** Add pop-in animation when drag starts (scale from 0.5 → 1.2)

### Phase 2: Cartoon Trash Bin
- [ ] **T2.1** Create `AnimatedTrashBin.tsx` component with SVG trash bin
- [ ] **T2.2** Implement lid animation states: closed, opening, open, closing
- [ ] **T2.3** Add CSS keyframe animations for lid movement (rotate around hinge point)
- [ ] **T2.4** Style with playful appearance: rounded corners, slight bounce on hover
- [ ] **T2.5** Replace TrashZone in App.tsx with AnimatedTrashBin

### Phase 3: Last Theme Protection
- [ ] **T3.1** Add `canDelete` check that returns false when `visibleThemes.length === 1`
- [ ] **T3.2** Create "shake" rejection animation for trash bin
- [ ] **T3.3** Add toast/notification component for "Need at least one theme" message
- [ ] **T3.4** Implement bounce-back animation for rejected drag

### Phase 4: Delete Animation
- [ ] **T4.1** Create "swallow" animation sequence for successful drops
- [ ] **T4.2** Animate ghost element: shrink + fall into bin
- [ ] **T4.3** Add lid snap-close animation after swallow
- [ ] **T4.4** Implement particle/poof effect on successful delete (optional)
- [ ] **T4.5** Animate the remaining theme dots to fill the gap smoothly

### Phase 5: Polish & Testing
- [ ] **T5.1** Verify all animations work on touch devices (mobile Safari, Chrome)
- [ ] **T5.2** Test with Playwright MCP - verify visual states
- [ ] **T5.3** Performance audit: ensure 60fps during drag animations
- [ ] **T5.4** Add reduced-motion support (`prefers-reduced-motion` query)
- [ ] **T5.5** Test edge cases: rapid drag/drop, multiple themes, single theme

## Dependencies
- T1.* must complete before T4.* (ghost element needed for delete animation)
- T2.* must complete before T3.* (trash bin needed for rejection animation)
- T2.* and T1.* can be parallelized

## Validation
- Visual inspection via Chrome DevTools and Playwright
- Touch testing on real iOS/Android devices
- Performance profiling with Chrome DevTools Performance tab
