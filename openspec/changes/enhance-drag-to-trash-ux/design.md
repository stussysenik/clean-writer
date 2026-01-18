# Design: Floating Drag-to-Trash UX

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ ThemeSelector   │───▶│ DragContext (new)                │ │
│  │  - dragIndex    │    │  - isDragging                    │ │
│  │  - dragPosition │    │  - dragPosition {x, y}           │ │
│  │  - dragColor    │    │  - draggedTheme                  │ │
│  └─────────────────┘    │  - trashState                    │ │
│                         └─────────────────────────────────┘ │
│                                    │                         │
│            ┌───────────────────────┼───────────────────────┐│
│            ▼                       ▼                       ▼││
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐││
│  │ DragGhost       │    │AnimatedTrashBin │    │Toast     │││
│  │ (Portal)        │    │ - idle/hover/   │    │Component │││
│  │ - follows cursor│    │   accept/reject │    │          │││
│  └─────────────────┘    └─────────────────┘    └──────────┘││
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### DragGhost.tsx
```typescript
interface DragGhostProps {
  color: string;
  position: { x: number; y: number };
  isVisible: boolean;
  isOverTrash: boolean;
}
```

**Rendering Strategy:**
- Use React Portal to render at document.body level
- Position with `position: fixed` and `transform: translate()`
- Apply `pointer-events: none` to prevent blocking interactions

**Animation States:**
1. **Appearing**: scale 0 → 1.2, opacity 0 → 0.9
2. **Following**: smooth easing with 50ms lag
3. **Over Trash**: scale 1.2 → 1.0, add red tint
4. **Deleting**: scale 1.0 → 0, fall animation, opacity → 0
5. **Rejected**: bounce back to original position

### AnimatedTrashBin.tsx
```typescript
interface AnimatedTrashBinProps {
  isVisible: boolean;
  state: 'idle' | 'hover' | 'accepting' | 'rejecting' | 'swallowing';
  onAnimationComplete?: () => void;
}
```

**SVG Structure:**
```svg
<svg viewBox="0 0 64 80">
  <!-- Bin body -->
  <path class="bin-body" d="..." />

  <!-- Lid (animated) -->
  <g class="lid" transform-origin="32 16">
    <path class="lid-top" d="..." />
    <rect class="lid-handle" ... />
  </g>

  <!-- Face (optional, for personality) -->
  <g class="face">
    <circle class="eye-left" ... />
    <circle class="eye-right" ... />
  </g>
</svg>
```

**Animation Keyframes:**
```css
@keyframes lidOpen {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-45deg); }
}

@keyframes lidClose {
  0% { transform: rotate(-45deg); }
  70% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px) rotate(-5deg); }
  75% { transform: translateX(8px) rotate(5deg); }
}

@keyframes swallow {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
  100% { transform: scaleY(1); }
}
```

## State Management

### New State in App.tsx
```typescript
// Drag state (lifted from ThemeSelector for cross-component access)
const [dragState, setDragState] = useState<{
  isDragging: boolean;
  draggedTheme: { id: string; color: string } | null;
  position: { x: number; y: number };
  isOverTrash: boolean;
}>({
  isDragging: false,
  draggedTheme: null,
  position: { x: 0, y: 0 },
  isOverTrash: false,
});

// Trash bin animation state
const [trashState, setTrashState] = useState<
  'hidden' | 'idle' | 'hover' | 'accepting' | 'rejecting' | 'swallowing'
>('hidden');

// Toast state for last-theme warning
const [showLastThemeToast, setShowLastThemeToast] = useState(false);
```

### Event Flow
```
Long Press Detected
       │
       ▼
┌──────────────────┐
│ setDragState({   │
│   isDragging: true,
│   draggedTheme,  │
│   position       │
│ })               │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Show DragGhost   │◀────┐
│ Show TrashBin    │     │ Mouse/Touch Move
└────────┬─────────┘     │ Updates position
         │               │
         ▼               │
    Position Update ─────┘
         │
         ▼
┌──────────────────┐
│ Over Trash Zone? │
└────────┬─────────┘
    Yes  │  No
    ▼    ▼
┌───────┐ ┌────────────┐
│Hover  │ │ Over other │
│state  │ │ theme?     │
└───┬───┘ └──────┬─────┘
    │            │
    ▼            ▼
Release      Reorder
    │
    ▼
┌──────────────────┐
│ Last theme?      │
└────────┬─────────┘
    Yes  │  No
    ▼    ▼
┌───────┐ ┌───────────┐
│Reject │ │ Accept &  │
│+ Toast│ │ Delete    │
└───────┘ └───────────┘
```

## Performance Considerations

### Smooth Animation (60fps)
- Use `transform` instead of `top/left` for GPU acceleration
- Use `requestAnimationFrame` for position updates
- Apply `will-change: transform` during drag
- Remove `will-change` after animation completes

### Touch Device Optimization
- Use `touch-action: none` on draggable elements
- Prevent scroll during drag with `e.preventDefault()`
- Test on low-end devices

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .drag-ghost,
  .trash-bin {
    transition: none;
    animation: none;
  }
}
```

## Alternatives Considered

### 1. Native HTML5 Drag & Drop
**Rejected** because:
- Poor touch support on mobile
- Limited styling of drag preview
- Inconsistent behavior across browsers

### 2. React DnD Library
**Rejected** because:
- Additional dependency
- Overkill for this simple use case
- Learning curve for maintenance

### 3. Framer Motion
**Considered** but deferred:
- Would provide smoother animations
- Could be added as future enhancement
- Current CSS animations sufficient for MVP
