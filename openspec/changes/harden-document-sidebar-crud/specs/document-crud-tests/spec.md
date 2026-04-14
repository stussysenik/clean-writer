## ADDED Requirements

### Requirement: A Cypress spec SHALL exist for DocumentSidebar CRUD regressions
The system SHALL ship a `tests/cypress/specs/document-sidebar-crud.cy.ts` spec file containing regression tests for rapid creation, document switching, deletion of the active document, calendar interaction, and persistence across reloads.

#### Scenario: The spec file is registered with Cypress
- **GIVEN** the Cypress config matches `tests/cypress/specs/**/*.cy.ts`
- **WHEN** the test runner enumerates specs
- **THEN** `document-sidebar-crud.cy.ts` is included in the list

### Requirement: Tests SHALL cover rapid sequential creation of projects and documents
The spec SHALL include tests that create multiple projects and multiple documents in tight succession and verify that each one persists with a distinct identity and position.

#### Scenario: Rapid project creation test
- **GIVEN** the test creates two projects via the inline form within 100 ms
- **THEN** the test asserts that both projects appear in the sidebar
- **AND** that they have distinct positions

#### Scenario: Rapid document creation test
- **GIVEN** the test creates five documents via the inline form within the same test step
- **THEN** the test asserts that all five appear in the sidebar
- **AND** that each has its specified title

### Requirement: Tests SHALL cover document-switch persistence
The spec SHALL include a test that types into one document, switches to another, switches back, and verifies the original content is preserved.

#### Scenario: Switch-and-return content preservation test
- **GIVEN** the test types "first content" into document A
- **WHEN** the test switches to document B and back to document A
- **THEN** the editor contains "first content"

### Requirement: Tests SHALL cover deletion of the active document
The spec SHALL include a test that deletes the currently-active document and verifies the editor falls back gracefully without crashing or rendering stale content.

#### Scenario: Active document deletion test
- **GIVEN** the test has documents A and B in the same project, with A active
- **WHEN** the test deletes A
- **THEN** B becomes active
- **AND** the editor displays B's content
- **AND** no console errors are raised during the operation

### Requirement: Tests SHALL cover calendar create-and-select interactions
The spec SHALL include a test that clicks an empty calendar cell, verifies a new entry is created, and verifies the cell visually transitions to the has-entry state.

#### Scenario: Calendar cell click test
- **GIVEN** the calendar shows the current month with no entry on a past date
- **WHEN** the test clicks that past date's cell
- **THEN** a journal entry is created for that date
- **AND** the cell shows the has-entry visual state
- **AND** the entry becomes the active document

### Requirement: Tests SHALL verify persistence across reloads
The spec SHALL include reload assertions to confirm that creates, edits, deletes, and calendar interactions survive a full page reload.

#### Scenario: Reload persistence test
- **GIVEN** the test creates a document and types content
- **WHEN** the test reloads the page
- **THEN** the document still exists in the sidebar
- **AND** its content is unchanged
