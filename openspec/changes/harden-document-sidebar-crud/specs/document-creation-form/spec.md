## ADDED Requirements

### Requirement: New documents SHALL be created via an inline form with naming, type, and project selection
The system SHALL render an inline collapsible creation form in the DocumentSidebar that captures the title, document type, and parent project before calling the create handler.

#### Scenario: Opening the document creation form
- **GIVEN** the DocumentSidebar is open
- **WHEN** the user clicks the "New Doc" quick action
- **THEN** an inline form appears below the quick-actions row with three fields: a title input (autofocused), a document-type select (`chapter`, `standalone`, `scratchpad`), and a project select that defaults to the first project (or "Unfiled" if no projects exist)
- **AND** the form has a primary submit button labelled "Create"

#### Scenario: Submitting a valid creation form
- **GIVEN** the creation form is open and the user has typed "Chapter One" and selected `chapter` and `Project Alpha`
- **WHEN** the user clicks "Create" or presses Enter
- **THEN** the document is created with the entered title and selected type/project
- **AND** the form collapses
- **AND** the new document becomes the active document

#### Scenario: Cancelling the creation form
- **GIVEN** the creation form is open with text in the title field
- **WHEN** the user presses Escape
- **THEN** the form collapses and the title input is cleared
- **AND** no document is created

### Requirement: Project creation SHALL use the same inline-form pattern
The system SHALL render an inline collapsible form for project creation with a single title field.

#### Scenario: Creating a project via the form
- **GIVEN** the DocumentSidebar is open
- **WHEN** the user clicks "New Project" and types "My Novel" and presses Enter
- **THEN** the project is created with title "My Novel"
- **AND** the form collapses

### Requirement: Creation submissions SHALL be async-aware and protected against double-submit
The system SHALL disable the submit button while the create call is pending, surface an inline error if the call fails, and prevent rapid double-clicks from creating duplicate rows.

#### Scenario: Submitting while a create call is in flight
- **GIVEN** the user has clicked "Create" once and the call has not yet resolved
- **WHEN** the user clicks "Create" again immediately
- **THEN** the second click is ignored
- **AND** exactly one document is created

#### Scenario: A creation call returns null (failure)
- **GIVEN** the user submits the form and the underlying create handler returns `null`
- **WHEN** the failure is observed
- **THEN** an inline error message appears below the form fields
- **AND** the form remains open with the user's input preserved
- **AND** the submit button re-enables
