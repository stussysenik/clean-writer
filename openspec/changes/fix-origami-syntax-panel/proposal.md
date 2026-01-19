# Change: Fix Origami Syntax Panel Animation & Add Collapsible Breakdown

## Why

The origami paper-fold bookmark animation is not working. The panel content is invisible because:
1. The 3D rotated panel (`rotateY(-90deg)`) is hidden behind the screen edge
2. The corner tab and panel are positioned separately without visual connection
3. Users have no clear affordance to interact with the corner tab

Additionally, users want the word type breakdown section to be collapsible for a cleaner UI.

## What Changes

1. **Fix 3D animation visibility** - Replace complex 3D transforms with a simpler, working slide-in approach that maintains the paper-fold aesthetic
2. **Unify corner tab and panel** - Connect the corner tab visually to the sliding panel
3. **Remove redundant "Syntax panel →" hint** - Hide the Toolbar hint once panel has been seen
4. **Add collapsible word type breakdown** - Allow users to collapse/expand the syntax breakdown section
5. **Support UTF-8 characters seamlessly** - Ensure Chinese Mandarin, emoji, and all Unicode characters display correctly in word counts and syntax panel

## Impact

- Affected specs: `syntax-panel` (new capability spec)
- Affected code:
  - `components/UnifiedSyntaxPanel/index.tsx`
  - `components/UnifiedSyntaxPanel/FoldContainer.tsx`
  - `components/UnifiedSyntaxPanel/CornerFoldTab.tsx`
  - `components/UnifiedSyntaxPanel/PanelBody.tsx`
  - `components/Toolbar/index.tsx`
