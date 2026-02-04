## Why

The mobile harmonica gesture requires three separate drags in different directions (left → up → left) to fully open the syntax panel. This feels disjointed and unnatural - users expect a single continuous motion like pulling a drawer.

## What Changes

- **Unify drag direction**: All stage transitions use the same direction (left/horizontal) instead of alternating left-up-left
- **Auto-cascade behavior**: One sustained drag advances through all stages based on cumulative distance:
  - 0-40px → peek (word count preview)
  - 40-120px → expand (breakdown header)
  - 120-220px → full (complete panel)
- **Snap-to-nearest on release**: Panel settles to the closest stage when user lifts finger
- **Remove vertical drag requirement**: Eliminate the awkward "drag up" phase for peek→expand transition

## Capabilities

### New Capabilities
- None (this modifies existing gesture behavior)

### Modified Capabilities
- None (implementation change only - no spec-level requirement changes; the panel still reveals progressively through stages)

## Impact

- `hooks/useHarmonicaDrag.ts` - Consolidate direction logic, implement distance-based cascading
- `components/UnifiedSyntaxPanel/HarmonicaContainer.tsx` - May need dimension interpolation adjustments
- `tests/e2e/responsive-syntax-panel.spec.ts` - Update drag test to use single-direction gesture
