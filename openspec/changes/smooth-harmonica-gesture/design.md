## Context

The mobile syntax panel uses a "harmonica" gesture pattern with 4 stages: closed → peek → expand → full. Currently, each transition requires a separate drag in alternating directions (left, up, left), forcing users to lift their finger and restart between stages.

**Current flow:**
```
closed ──(drag left 40px)──> peek ──(drag UP 60px)──> expand ──(drag left 80px)──> full
```

**Target flow:**
```
closed ──────────────(single continuous drag left)──────────────> full
         │                    │                        │
        40px                120px                    220px
        peek               expand                    full
```

## Goals / Non-Goals

**Goals:**
- Single continuous drag motion from closed to full
- Auto-cascade through stages based on cumulative horizontal distance
- Snap to nearest stage on release
- Preserve haptic feedback at stage boundaries
- Maintain visual resistance/acceleration feel

**Non-Goals:**
- Changing the visual design of stages
- Adding new stages or removing existing ones
- Changing desktop behavior (desktop panel is always visible)
- Gesture customization or settings

## Decisions

### 1. Unified horizontal drag direction

**Decision:** All stage transitions use leftward drag (negative X delta).

**Rationale:**
- Matches the panel's position (right edge) - pulling left to reveal
- Eliminates cognitive load of remembering direction changes
- Enables true single-motion interaction

**Alternative considered:** Keep vertical for expand stage (natural "pull up" metaphor). Rejected because it breaks flow and requires finger lift.

### 2. Cumulative distance thresholds

**Decision:** Stage boundaries at cumulative distances from drag start:

| Stage | Distance Range | Delta from Previous |
|-------|---------------|---------------------|
| closed | 0px | - |
| peek | 40px | 40px |
| expand | 120px | 80px |
| full | 220px | 100px |

**Rationale:**
- 40px for peek: Quick reveal of word count, low commitment
- 80px gap to expand: Deliberate action to see breakdown
- 100px gap to full: Largest distance for complete panel (most commitment)

**Alternative considered:** Equal spacing (40px each). Rejected because full panel should require more intentional drag.

### 3. Snap-to-nearest on release

**Decision:** On drag end, snap to the stage whose threshold is nearest to current drag distance.

```
Snap boundaries (midpoints):
- < 20px → closed
- 20-80px → peek
- 80-170px → expand
- > 170px → full
```

**Rationale:** Predictable behavior - users can release anywhere and panel settles logically.

**Alternative considered:** Velocity-based (fast flick → full). Added complexity without clear UX benefit.

### 4. Remove stage-specific drag direction logic

**Decision:** Eliminate `STAGE_TRANSITIONS` direction mapping. Replace with single cumulative distance calculation.

**Current code to remove:**
```typescript
const STAGE_TRANSITIONS: Record<HarmonicaStage, {
  dragDirection: 'left' | 'up';  // Remove this
  ...
}>
```

**New approach:**
```typescript
const STAGE_THRESHOLDS = {
  peek: 40,
  expand: 120,
  full: 220,
};
```

### 5. Preserve visual feedback during drag

**Decision:** Keep the resistance/acceleration easing in `HarmonicaContainer.tsx`. The interpolation logic doesn't need to change - it already interpolates between current and next stage dimensions based on `dragProgress`.

**Change needed:** `dragProgress` calculation must span from current stage to ultimate target (full) rather than just next stage.

## Risks / Trade-offs

**[Risk] Accidental full open** → Mitigation: 220px is a significant drag distance (~53% of iPhone screen width). Users must be intentional.

**[Risk] Loss of vertical gesture affordance** → Mitigation: The vertical drag was not discoverable anyway. Horizontal-only is more intuitive for a right-edge panel.

**[Risk] Existing muscle memory** → Mitigation: Low risk - the old gesture was unintuitive. New gesture is simpler to learn.

**[Trade-off] Longer drag for full panel** → Acceptable: 220px vs previous total of ~180px (40+60+80). The continuous motion feels faster than three separate drags.

## Implementation Notes

Files to modify:
1. `hooks/useHarmonicaDrag.ts` - Core logic changes
2. `tests/e2e/responsive-syntax-panel.spec.ts` - Update test to single drag

No changes needed to:
- `HarmonicaContainer.tsx` - Dimension interpolation already works with any stage/progress
- `UnifiedSyntaxPanel/index.tsx` - Just consumes hook output
