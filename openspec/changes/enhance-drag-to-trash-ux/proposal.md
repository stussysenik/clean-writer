# Enhance Drag-to-Trash UX with Floating Elements

## Summary
Transform the theme deletion interaction from a subtle drag gesture to a delightful "What You See Is What You Get" experience with floating color dots that follow the cursor, an animated cartoon-style trash bin, and clear visual feedback throughout the interaction.

## Problem Statement
The current drag-to-trash implementation has several UX gaps:
1. **No visual feedback during drag** - The theme dot scales up but doesn't actually follow the cursor
2. **Silent failure for last theme** - Users get no feedback when trying to delete the last visible theme
3. **Generic trash zone** - The current trash area lacks personality and visual appeal
4. **Missing delete animation** - No satisfying visual confirmation when a theme is deleted

## Proposed Solution

### 1. Floating Drag Ghost Element
When a long-press initiates drag mode, create a floating "ghost" copy of the color dot that:
- Appears at the cursor position with a subtle pop-in animation
- Follows the cursor smoothly with slight lag (easing)
- Has elevated shadow and slight transparency to indicate it's being moved
- Shows a subtle trail or motion blur effect

### 2. Cartoon-Style Animated Trash Bin
Replace the current minimal trash zone with an animated trash bin:
- **Idle state**: Closed lid, friendly appearance
- **Hover state**: Lid opens with anticipation animation
- **Drop state**: Swallows the item with a satisfying gulp animation
- **Reject state**: Shakes "no" when trying to delete the last theme

### 3. Last Theme Protection with Feedback
When user attempts to delete the last visible theme:
- Trash bin shakes side-to-side (rejection animation)
- Toast notification appears: "You need at least one theme"
- The dragged dot bounces back to its original position

### 4. Delete Confirmation Animation
When a theme is successfully dropped in trash:
- The floating dot shrinks and falls into the trash bin
- Bin lid closes with a satisfying snap
- Small particle burst or poof effect
- The original dot slot collapses smoothly

## Visual Reference
```
┌─────────────────────────────────────────┐
│  [●] [●] [●]    ← Theme dots            │
│       ↓                                  │
│      (●)        ← Floating ghost        │
│       ↓                                  │
│    ┌─────┐                              │
│    │ 🗑️  │      ← Cartoon trash bin     │
│    │     │         (lid opens on hover) │
│    └─────┘                              │
└─────────────────────────────────────────┘
```

## Technical Approach

### Ghost Element Implementation
- Create a portal-rendered element that exists outside the normal DOM flow
- Track cursor position with `requestAnimationFrame` for smooth updates
- Use CSS transforms for GPU-accelerated movement
- Apply `pointer-events: none` to prevent interference

### Trash Bin Animation
- SVG-based trash bin with animated paths for lid movement
- CSS keyframe animations for shake, bounce, and gulp effects
- State machine: `idle` → `hover` → `accepting` → `swallowing` → `idle`

### State Communication
- Add `dragPosition` state to track cursor coordinates
- Add `trashState` to manage trash bin animation states
- Add `showLastThemeWarning` for rejection feedback

## Files to Modify
- `components/Toolbar/ThemeSelector.tsx` - Add ghost element, position tracking
- `App.tsx` - Replace TrashZone with AnimatedTrashBin component
- New: `components/AnimatedTrashBin.tsx` - Cartoon trash bin component
- New: `components/DragGhost.tsx` - Floating ghost element component

## Out of Scope
- Drag-to-reorder visual feedback (future enhancement)
- Custom palette deletion confirmation dialog
- Undo functionality after deletion
