# Drag-to-Trash Implementation

## Overview

This implementation replaces the previous delete-mode UI with an intuitive drag-and-drop interface for hiding preset themes and deleting custom palettes. Users can now long-press on a theme or palette, drag it to a trash zone at the top of the screen, and release to remove it.

## User Experience

### For Preset Themes
1. **Long-press** on any visible theme circle (400ms threshold)
2. The theme enters drag mode and scales up
3. Drag the theme to the trash zone at the top of the screen
4. Drop to hide the theme from the theme selector
5. The theme can be restored later through the theme customizer

### For Custom Palettes
1. **Long-press** on any custom palette circle
2. The palette enters drag mode and scales up
3. Drag the palette to the trash zone at the top of the screen
4. Drop to permanently delete the palette

### For Reordering Themes
1. **Long-press** on any preset theme circle
2. While in drag mode, hover over another theme circle
3. The target theme highlights to indicate it will be swapped
4. Release to reorder the themes

## Technical Implementation

### ThemeSelector.tsx

**Key State Variables:**
- `dragItemType`: Tracks whether dragging a 'preset' or 'custom' item
- `isDragMode`: Boolean flag indicating active drag state
- `dragIndex`: Index of the item being dragged
- `dragOverIndex`: Index of the drop target (for reordering)
- `pressedIndex`: Tracks visual press state during long-press

**Key Functions:**
- `handlePressStart`: Initiates long-press detection
- `handlePressMove`: Tracks drag movement and detects hover targets
- `handlePressEnd`: Completes the drag operation (delete or reorder)
- `handleThemeClick`: Simplified to only select themes (removed delete mode logic)
- `handlePaletteClick`: Simplified to only select palettes (removed delete mode logic)

**Props Added:**
- `onDragStart`: Callback when drag mode begins (shows trash zone)
- `onDragEnd`: Callback when drag mode ends (hides trash zone)
- `isDraggingOverTrash`: Boolean indicating if item is over trash zone

**Props Removed:**
- All references to `isDeleteMode`
- All delete mode overlay logic

### App.tsx

**New State Variables:**
```typescript
const [isDragging, setIsDragging] = useState(false);
const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
```

**New Handlers:**
```typescript
const handleDragStart = () => {
  setIsDragging(true);
};

const handleDragEnd = () => {
  setIsDragging(false);
  setIsDraggingOverTrash(false);
};

const handleDragOverTrash = (isOver: boolean) => {
  setIsDraggingOverTrash(isOver);
};
```

**TrashZone Component:**
- Fixed position at top of screen
- Only visible when `isDragging` is true
- Visual feedback changes when dragging over the zone
- Uses theme colors for consistent styling
- Animated scale and shadow effects on hover

### Props Flow

```
App.tsx
├── ThemeSelector
│   ├── onDragStart → setIsDragging(true)
│   ├── onDragEnd → setIsDragging(false)
│   └── isDraggingOverTrash → controls drop behavior
│
└── TrashZone
    └── visible when isDragging === true
```

## Visual Design

### Drag Mode Feedback
- **Being Dragged**: Item scales to 1.3x, elevated shadow (z-index 50)
- **Drag Target (for reordering)**: Item scales to 1.15x
- **Trash Zone Highlight**: Background color uses theme accent with 20% opacity
- **Trash Icon**: 32px SVG, themed to current theme colors

### Haptic Feedback
- Vibration triggers when long-press threshold is reached (50ms)
- Helps users confirm they've entered drag mode

### Animations
- Drag items: 150ms ease transitions
- Trash zone: 200ms ease transitions
- Scale and shadow effects on hover

## Edge Cases Handled

1. **Only One Theme Visible**: Cannot hide the last visible theme (preserves at least one theme)
2. **Touch Movement Threshold**: Long-press is cancelled if moved >10px before threshold
3. **Global Drag Listeners**: Mouse/touch events captured globally during drag
4. **Drag Cleanup**: All drag state is reset when drag ends

## Testing Checklist

- [ ] Long-press on theme enters drag mode
- [ ] Drag to trash zone hides the theme
- [ ] Cannot delete last visible theme
- [ ] Long-press on custom palette enters drag mode
- [ ] Drag to trash zone deletes the palette
- [ ] Drag to another theme reorders them
- [ ] Drag to empty space cancels without action
- [ ] Touch movement cancels long-press
- [ ] Haptic feedback triggers correctly
- [ ] Trash zone appears/disappears smoothly
- [ ] Visual feedback when hovering over trash zone
- [ ] Visual feedback when hovering over other themes

## Future Enhancements

Potential improvements to consider:

1. **Undo Functionality**: Add undo toast after delete action
2. **Confirmation Dialog**: Show confirmation before permanently deleting custom palettes
3. **Keyboard Support**: Add keyboard shortcuts for drag operations
4. **Accessibility**: Improve screen reader announcements for drag state
5. **Custom Threshold**: Allow users to adjust long-press duration in settings
6. **Multi-select**: Drag multiple items at once

## Files Modified

1. **components/Toolbar/ThemeSelector.tsx**
   - Removed all delete mode logic
   - Added drag-and-drop handlers
   - Updated visual feedback
   - Simplified click handlers

2. **App.tsx**
   - Added drag state management
   - Created TrashZone component
   - Connected ThemeSelector drag callbacks
   - Added drag-to-trash functionality

## Migration Notes

Previous delete mode implementation involved:
- Separate delete state that persisted
- Overlay with trash icon on all theme buttons
- "Tap to hide" hint message
- Delete mode timeout reset on actions

New implementation:
- Delete only happens during active drag
- No persistent delete mode
- Trash zone appears only when needed
- "Drag to reorder" hint message
- More intuitive and faster workflow