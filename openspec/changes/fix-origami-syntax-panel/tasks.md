# Tasks

## 1. Fix Animation System

- [ ] 1.1 Replace 3D rotateY/rotateX transforms with reliable slide-in animation in `FoldContainer.tsx`
- [ ] 1.2 Use `translateX` for horizontal slide (right edge to visible)
- [ ] 1.3 Keep paper texture and shadow effects for visual polish
- [ ] 1.4 Ensure smooth easing with spring-like bounce on open

## 2. Unify Corner Tab & Panel

- [ ] 2.1 Attach corner tab to panel edge (not separate fixed positions)
- [ ] 2.2 Corner tab slides with panel as single unit
- [ ] 2.3 Word count displays on tab when closed, hides when open
- [ ] 2.4 Add subtle drag affordance indicator on corner tab

## 3. Remove Redundant Toolbar Hint

- [ ] 3.1 Hide "Syntax panel →" hint in Toolbar when `hasSeenSyntaxPanel` is true
- [ ] 3.2 Verify hint disappears after first panel open

## 4. Add Collapsible Word Type Breakdown

- [ ] 4.1 Add collapse/expand toggle button in `PanelBody.tsx` header
- [ ] 4.2 Store collapsed state in localStorage for persistence
- [ ] 4.3 Animate height transition when collapsing/expanding
- [ ] 4.4 Show summary count when collapsed (e.g., "9 word types")

## 5. UTF-8 Character Support

- [ ] 5.1 Ensure word count correctly handles CJK characters (Chinese, Japanese, Korean)
- [ ] 5.2 Display emoji correctly in syntax panel and word counts
- [ ] 5.3 Use proper Unicode-aware word segmentation for CJK text
- [ ] 5.4 Verify font stack includes CJK-capable fonts

## 6. Verification

- [ ] 6.1 Test on mobile: tap corner tab opens panel smoothly
- [ ] 6.2 Test drag gesture: drag left to open, right to close
- [ ] 6.3 Test collapsible breakdown: tap to collapse/expand
- [ ] 6.4 Verify reduced motion: uses simple opacity fade
- [ ] 6.5 Verify "Syntax panel →" hint disappears after first open
- [ ] 6.6 Test with Chinese text: 你好世界 displays correctly
- [ ] 6.7 Test with emoji: displays correctly in UI
