# Syntax Panel

## ADDED Requirements

### Requirement: Slide-In Panel Animation
The syntax panel SHALL slide in from the right edge of the screen using horizontal translation, with a spring-like easing for natural motion.

#### Scenario: Panel opens on tap
- **WHEN** user taps the corner tab
- **THEN** panel slides in from right with `translateX(0)` and spring easing
- **AND** corner tab remains attached to panel edge

#### Scenario: Panel closes on outside tap
- **WHEN** panel is open AND user taps outside panel
- **THEN** panel slides out with `translateX(100%)` animation
- **AND** corner tab returns to closed position with word count visible

#### Scenario: Drag gesture opens panel
- **WHEN** user drags left on corner tab by more than 30px
- **THEN** panel slides open following finger position
- **AND** commits to open state when released past 50% threshold

### Requirement: Collapsible Word Type Breakdown
The word type breakdown section SHALL be collapsible, allowing users to hide detailed statistics while keeping the word count visible.

#### Scenario: User collapses breakdown
- **WHEN** user taps the collapse toggle in the panel header
- **THEN** word type list animates to hidden with height transition
- **AND** collapsed state persists in localStorage

#### Scenario: User expands breakdown
- **WHEN** breakdown is collapsed AND user taps expand toggle
- **THEN** word type list animates to visible
- **AND** expanded state persists in localStorage

#### Scenario: Summary shown when collapsed
- **WHEN** breakdown is collapsed
- **THEN** panel shows summary text (e.g., "9 word types")
- **AND** word count remains visible in header

### Requirement: Corner Tab Visual Affordance
The corner tab SHALL provide clear visual cues that it is interactive.

#### Scenario: First-time user hint
- **WHEN** user has never opened the panel (`hasSeenSyntaxPanel` is false)
- **THEN** corner tab displays pulse animation
- **AND** toolbar hint "Syntax panel →" is visible on mobile

#### Scenario: Returning user
- **WHEN** user has previously opened the panel
- **THEN** corner tab displays without pulse
- **AND** toolbar hint is hidden

### Requirement: Reduced Motion Support
The panel SHALL respect user's reduced motion preference.

#### Scenario: Reduced motion enabled
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** panel uses instant opacity fade instead of slide animation
- **AND** no spring/bounce effects are applied

### Requirement: UTF-8 Character Support
The syntax panel SHALL correctly display and count all UTF-8 characters including CJK (Chinese, Japanese, Korean) text and emoji.

#### Scenario: Chinese text display
- **WHEN** user types Chinese characters (e.g., "你好世界")
- **THEN** characters display correctly in the editor
- **AND** word count reflects proper CJK word segmentation

#### Scenario: Emoji display
- **WHEN** user types emoji characters (e.g., "Hello")
- **THEN** emoji display correctly at full resolution
- **AND** emoji are counted appropriately in word statistics

#### Scenario: Mixed content
- **WHEN** content contains mixed Latin, CJK, and emoji characters
- **THEN** all characters render correctly without replacement glyphs
- **AND** font stack falls back gracefully for all Unicode ranges
