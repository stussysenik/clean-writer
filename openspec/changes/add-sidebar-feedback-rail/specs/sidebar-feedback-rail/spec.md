## ADDED Requirements

### Requirement: Non-Overlapping Desktop Utility Rail
The system SHALL reserve horizontal space for the left utility rail on desktop when the sidebar is open.

#### Scenario: Desktop rail opens
- **WHEN** the viewport is desktop-sized
- **AND** the user opens the document sidebar
- **THEN** the top controls shift to the right of the rail
- **AND** the writing surface gains matching left padding
- **AND** the rail does not sit on top of the editor column

### Requirement: Sidebar Guide Instead of Help Modal
The system SHALL expose writing guidance inside the sidebar rail rather than in a centered modal.

#### Scenario: User opens help
- **WHEN** the user activates the help button
- **THEN** the sidebar opens
- **AND** the guide section is expanded and scrolled into view
- **AND** no centered help modal appears

### Requirement: Feedback Notes In The Rail
The system SHALL let users leave product notes from the sidebar rail without blocking the writing flow.

#### Scenario: User saves a note offline
- **WHEN** the user submits a feedback note without Supabase configured
- **THEN** the note is saved locally
- **AND** the rail confirms that the note is stored on the device

#### Scenario: User saves a note with Supabase configured
- **WHEN** the user submits a feedback note with Supabase configured
- **THEN** the note is saved locally first
- **AND** the system attempts to mirror it to Supabase
- **AND** the rail shows whether the note synced or remained local-only
