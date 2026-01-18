# Change: Add Responsive Syntax Toolbar with Mobile-First Side Panel

## Why
On mobile devices, the bottom toolbar's SyntaxToggles takes up valuable screen space and competes with the UnifiedSyntaxPanel which already provides richer functionality. Users need a cleaner mobile experience that leverages the side panel as the primary syntax control.

## What Changes
- **Hide SyntaxToggles on mobile** (< 768px) in the bottom toolbar
- **Add visual hint** on mobile pointing users to the side panel
- **Keep full toolbar on desktop** (≥ 768px) for power users with keyboard shortcuts
- **Enhance side panel discoverability** with a subtle pulse/glow animation on first visit

## Impact
- Affected specs: `specs/enhanced-syntax-highlighting.md`
- Affected code:
  - `components/Toolbar/index.tsx` - Responsive hiding of SyntaxToggles
  - `components/Toolbar/SyntaxToggles.tsx` - Add responsive wrapper
  - `components/UnifiedSyntaxPanel.tsx` - Add first-visit hint animation
  - `App.tsx` - Track first-visit state for hint
