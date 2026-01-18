## MODIFIED Requirements

### Requirement: Responsive Syntax Controls
The system SHALL provide syntax highlighting controls that adapt to screen size:
- On desktop (≥ 768px): Full SyntaxToggles toolbar at bottom with keyboard shortcuts 1-9
- On mobile (< 768px): SyntaxToggles hidden, side panel (UnifiedSyntaxPanel) serves as primary control

#### Scenario: Desktop user sees full toolbar
- **WHEN** viewport width is 768px or greater
- **THEN** SyntaxToggles are visible in bottom toolbar
- **AND** keyboard shortcuts 1-9 work for toggling

#### Scenario: Mobile user uses side panel
- **WHEN** viewport width is less than 768px
- **THEN** SyntaxToggles are hidden from bottom toolbar
- **AND** a hint indicator points to the side panel
- **AND** side panel provides full functionality (word count, toggles, reorder)

## ADDED Requirements

### Requirement: First-Visit Side Panel Hint
The system SHALL guide first-time mobile users to discover the side panel with a subtle animation.

#### Scenario: First visit shows hint animation
- **WHEN** user has not previously interacted with the side panel
- **AND** viewport is mobile-sized
- **THEN** the side panel tab shows a subtle pulse/glow animation
- **AND** the animation stops after user opens the panel once

#### Scenario: Returning user sees no hint
- **WHEN** user has previously opened the side panel
- **THEN** no hint animation is shown
- **AND** the panel tab appears in its normal state
