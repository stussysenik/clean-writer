# Mobile Input Capability

## ADDED Requirements

### Requirement: Virtual Keyboard Detection
The system SHALL detect when a virtual keyboard is open on mobile devices using the VirtualKeyboard API (Chrome 94+) with VisualViewport API fallback.

#### Scenario: VirtualKeyboard API available (Chrome 94+)
- **WHEN** the browser supports `navigator.virtualKeyboard`
- **THEN** the system SHALL use `boundingRect.height` and `geometrychange` events for keyboard detection
- **AND** the system SHALL report keyboard height accurately

#### Scenario: VirtualKeyboard API unavailable (Safari, Firefox)
- **WHEN** the browser does not support VirtualKeyboard API
- **AND** `window.visualViewport` is available
- **THEN** the system SHALL fall back to VisualViewport resize detection
- **AND** use the difference between `window.innerHeight` and `visualViewport.height` as keyboard height

#### Scenario: Reduced motion preference
- **WHEN** the user has reduced motion preference enabled
- **THEN** the system SHALL apply opacity transitions instead of transform animations when keyboard state changes

### Requirement: Selection Persistence for Mobile Actions
The system SHALL preserve text selection when users tap on toolbar actions on mobile devices.

#### Scenario: User taps strikethrough button on mobile
- **WHEN** a user has text selected in the editor
- **AND** the user taps the strikethrough button
- **THEN** the system SHALL apply strikethrough to the previously selected text
- **AND** the selection SHALL NOT be lost due to focus change

#### Scenario: Selection saved before blur
- **WHEN** a user touches a toolbar button (`pointerdown`/`touchstart`)
- **THEN** the system SHALL save the current selection before the `blur` event fires
- **AND** the saved selection SHALL be available to the click handler

#### Scenario: Selection auto-clear
- **WHEN** a saved selection is not used within 5 seconds
- **THEN** the system SHALL automatically clear the saved selection

### Requirement: Strikethrough Marker Merge
The system SHALL merge adjacent or overlapping strikethrough markers instead of creating doubled markers like `~~~~`.

#### Scenario: Extend existing strikethrough to include more text
- **WHEN** a user selects text that includes existing strikethrough (e.g., `hello ~~world~~`)
- **AND** the user applies strikethrough to the entire selection
- **THEN** the system SHALL produce `~~hello world~~`
- **AND** NOT produce `~~hello ~~~~world~~~~~~`

#### Scenario: Apply strikethrough to text without existing markers
- **WHEN** a user selects text without strikethrough markers
- **AND** the user applies strikethrough
- **THEN** the system SHALL wrap the text with `~~` markers

#### Scenario: Merge multiple adjacent strikethroughs
- **WHEN** a user selects text like `~~a~~ b ~~c~~`
- **AND** the user applies strikethrough to the entire selection
- **THEN** the system SHALL produce `~~a b c~~`

### Requirement: Word Counter Right-Edge Positioning
The system SHALL position the word counter/syntax panel tab at the right edge of the screen on all devices.

#### Scenario: Word counter visible on mobile
- **WHEN** viewing the app on a mobile device
- **THEN** the word counter tab SHALL be positioned at the right edge of the viewport
- **AND** SHALL NOT float in the middle of the screen

#### Scenario: Panel opens from tab
- **WHEN** the user taps the word counter tab
- **THEN** the panel SHALL slide open from the right edge
- **AND** the tab SHALL remain attached to the panel
