## ADDED Requirements

### Requirement: Unified horizontal drag direction
The mobile syntax panel harmonica gesture SHALL use a single horizontal (leftward) drag direction for all stage transitions.

#### Scenario: Single drag opens panel fully
- **WHEN** user drags the fold tab left continuously for 220px or more
- **THEN** the panel progresses through peek → expand → full stages in one motion

#### Scenario: Partial drag shows intermediate stage
- **WHEN** user drags left 80px and releases
- **THEN** the panel snaps to the peek stage (nearest threshold)

### Requirement: Distance-based stage transitions
The panel SHALL transition through stages based on cumulative horizontal drag distance from the initial touch point.

#### Scenario: Peek stage at 40px
- **WHEN** user drags left past 40px threshold
- **THEN** the panel enters peek stage showing word count preview

#### Scenario: Expand stage at 120px
- **WHEN** user drags left past 120px threshold
- **THEN** the panel enters expand stage showing breakdown header

#### Scenario: Full stage at 220px
- **WHEN** user drags left past 220px threshold
- **THEN** the panel enters full stage showing complete panel content

### Requirement: Snap to nearest stage on release
The panel SHALL snap to the nearest stage boundary when the user releases the drag.

#### Scenario: Release between stages snaps to nearest
- **WHEN** user drags left 100px (between peek at 40px and expand at 120px) and releases
- **THEN** the panel snaps to expand stage (nearest threshold)

#### Scenario: Release near closed snaps back
- **WHEN** user drags left 15px and releases
- **THEN** the panel snaps back to closed state

## REMOVED Requirements

### Requirement: Vertical drag for peek-to-expand transition
**Reason**: Replaced by unified horizontal gesture for smoother continuous interaction
**Migration**: Users now drag left continuously instead of changing direction
