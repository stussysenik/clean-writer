## ADDED Requirements

### Requirement: The DocumentSidebar SHALL render a month-grid calendar of journal entries
The system SHALL render a `CalendarSection` component inside the DocumentSidebar that displays a 7-column month grid with one cell per day, indicating which days have a journal entry.

#### Scenario: Viewing the calendar with mixed entries
- **GIVEN** the user has journal entries on March 5, March 12, and March 14, 2026
- **WHEN** the user opens the DocumentSidebar in March 2026
- **THEN** the calendar grid renders with cells for every day of March
- **AND** the cells for March 5, 12, and 14 visually indicate they have an entry
- **AND** the cell for today (the current date) shows a distinct ring/highlight

### Requirement: Clicking a calendar cell with an entry SHALL select that entry
The system SHALL fire the `onSelectEntry` callback with the entry id when the user clicks a cell whose date matches an existing journal entry.

#### Scenario: Selecting an existing entry from the calendar
- **GIVEN** an entry exists for March 12, 2026 and the calendar is showing March 2026
- **WHEN** the user clicks the cell for March 12
- **THEN** the entry for March 12 becomes the active document
- **AND** the editor displays its content

### Requirement: Clicking an empty calendar cell SHALL create and select a new entry
The system SHALL call `createJournalEntry(date)` with the cell's date and immediately select the newly-created entry when the user clicks an empty cell whose date is today or earlier.

#### Scenario: Creating a backdated entry from the calendar
- **GIVEN** no entry exists for March 8, 2026 and today's date is March 14, 2026
- **WHEN** the user clicks the cell for March 8
- **THEN** a new journal entry is created with `entryDate: 2026-03-08`
- **AND** the new entry becomes the active document
- **AND** the cell for March 8 now shows the has-entry state

#### Scenario: Future-dated cells are non-interactive
- **GIVEN** today's date is March 14, 2026
- **WHEN** the user clicks the cell for March 20, 2026
- **THEN** no entry is created
- **AND** no callback is fired
- **AND** the cell renders in a disabled visual state

### Requirement: The displayed month SHALL be navigable and persisted
The system SHALL provide previous-month and next-month controls plus a "Today" jump, and SHALL persist the currently-displayed month to localStorage so it survives reloads.

#### Scenario: Navigating to a different month
- **GIVEN** the calendar is showing March 2026
- **WHEN** the user clicks the previous-month arrow
- **THEN** the calendar shows February 2026

#### Scenario: Returning to the current month
- **GIVEN** the calendar is showing November 2025
- **WHEN** the user clicks "Today"
- **THEN** the calendar jumps to the month containing today's date and the today cell is focused

#### Scenario: Persisted view month survives reload
- **GIVEN** the user navigates the calendar to January 2026
- **WHEN** the page is reloaded
- **THEN** the calendar reopens to January 2026
