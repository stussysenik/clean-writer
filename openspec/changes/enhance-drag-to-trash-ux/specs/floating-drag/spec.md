# Floating Drag-to-Trash Interaction

## ADDED Requirements

### Requirement: Floating Ghost Element
The system SHALL render a floating "ghost" copy of the theme color dot that follows the cursor during drag operations.

#### Scenario: Ghost appears on drag start
**Given** a user has long-pressed a theme color dot for 400ms
**When** the drag mode activates
**Then** a floating ghost element appears at the cursor position
**And** the ghost has the same color as the dragged theme
**And** the ghost has elevated shadow and 80% opacity
**And** the ghost scales in with a pop animation (0.5 → 1.2)

#### Scenario: Ghost follows cursor smoothly
**Given** the user is in drag mode with a floating ghost visible
**When** the user moves the cursor/finger
**Then** the ghost follows with smooth easing (50ms lag)
**And** the animation runs at 60fps without jank

#### Scenario: Ghost visual feedback over trash
**Given** the user is dragging a theme with visible ghost
**When** the ghost enters the trash zone area
**Then** the ghost scales down slightly (1.2 → 1.0)
**And** the ghost gets a subtle red tint overlay

---

### Requirement: Animated Cartoon Trash Bin
The system SHALL display an animated cartoon-style trash bin during drag operations.

#### Scenario: Trash bin appears on drag start
**Given** a user initiates a drag operation on a theme dot
**When** drag mode activates
**Then** an animated trash bin appears at the bottom of the screen
**And** the bin animates in with a slide-up effect
**And** the bin has a friendly, cartoon-like appearance

#### Scenario: Trash bin lid opens on hover
**Given** the trash bin is visible
**When** the dragged ghost enters the trash zone
**Then** the bin lid animates open (rotates up 45 degrees)
**And** the bin body may show a subtle anticipation animation

#### Scenario: Trash bin swallows on drop
**Given** the ghost is over the trash zone with lid open
**And** the theme can be deleted (not the last visible theme)
**When** the user releases the drag
**Then** the ghost animates shrinking and falling into the bin
**And** the lid snaps closed with a bounce
**And** the bin may show a brief gulp animation

---

### Requirement: Last Theme Protection Feedback
The system SHALL provide clear feedback when a user attempts to delete the last visible theme.

#### Scenario: Rejection animation on last theme delete attempt
**Given** only one theme is visible
**And** the user drags that theme to the trash zone
**When** the user releases the drag
**Then** the trash bin shakes side-to-side (rejection animation)
**And** the ghost bounces back toward its original position
**And** a toast notification appears with message about needing at least one theme
**And** the toast auto-dismisses after 3 seconds

#### Scenario: Toast is dismissible
**Given** the need at least one theme toast is visible
**When** the user taps or clicks the toast
**Then** the toast dismisses immediately

---

### Requirement: Delete Confirmation Animation
The system SHALL provide satisfying visual feedback when a theme is successfully deleted.

#### Scenario: Successful delete animation sequence
**Given** a user drops a deletable theme on the trash zone
**When** the delete is confirmed
**Then** the ghost shrinks while falling into the bin
**And** optional particle or poof effect plays
**And** the remaining theme dots animate to fill the gap
**And** the original dot position collapses smoothly

---

### Requirement: Reduced Motion Support
The system SHALL respect user accessibility preferences for reduced motion.

#### Scenario: Animations disabled for reduced motion preference
**Given** the user has prefers-reduced-motion reduce enabled
**When** any drag animation would play
**Then** the animation is replaced with instant state changes
**And** feedback is still provided via color and opacity changes

## MODIFIED Requirements

### Requirement: Theme Hiding Behavior Enhancement
The system SHALL trigger the full delete animation sequence with visual feedback when a theme is hidden, replacing the previous silent behavior.

#### Scenario: Theme hiding now uses animation
**Given** a user drags a theme to the trash zone
**When** the theme is hidden
**Then** the full delete animation sequence plays
**And** the user sees clear visual confirmation of the action
