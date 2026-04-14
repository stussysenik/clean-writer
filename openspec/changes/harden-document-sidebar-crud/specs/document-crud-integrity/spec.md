## ADDED Requirements

### Requirement: Editor content SHALL be flushed to the active document before any document switch
When the user selects a different document via the sidebar, the system SHALL persist the current editor content into the previously-active document row before swapping the active document and loading the new content.

#### Scenario: Switching documents within the autosave debounce window
- **GIVEN** the user is editing document A and has typed new characters within the last 500 ms
- **WHEN** the user clicks document B in the sidebar
- **THEN** document A's row in the documents store reflects the typed content immediately
- **AND** the editor surface displays document B's content
- **AND** reloading the page shows document A's typed content unchanged

#### Scenario: Switching documents while idle
- **GIVEN** the user has not typed for several seconds and the autosave has already settled
- **WHEN** the user clicks a different document
- **THEN** no extra write occurs (the flush is idempotent against unchanged content) and the new document loads normally

### Requirement: Per-document word and character counts SHALL stay in sync with editor content
The system SHALL update `wordCount` and `charCount` on the active document row whenever the editor content changes and the autosave path runs.

#### Scenario: Typing into a document updates the badge in the sidebar
- **GIVEN** a document with `wordCount: 0` is active
- **WHEN** the user types "hello world" and waits for the autosave debounce
- **THEN** the document row reports `wordCount: 2` and `charCount: 11`
- **AND** the ProjectTree badge for that document displays "2w"

### Requirement: Project and document positions SHALL be monotonic under concurrent creation
The system SHALL compute `position` for new projects and documents inside a functional state updater so that two creation calls within the same render frame produce distinct, sequential positions.

#### Scenario: Creating two projects within the same animation frame
- **GIVEN** the projects array is empty
- **WHEN** the user triggers `createProject("A")` and `createProject("B")` synchronously
- **THEN** the resulting projects array contains exactly two entries with `position: 0` and `position: 1`
- **AND** the sidebar renders them in creation order

#### Scenario: Creating five documents in quick succession
- **GIVEN** a project exists with no documents
- **WHEN** the user triggers `createDocument` five times in a tight loop
- **THEN** the documents array contains five distinct entries with positions 0 through 4

### Requirement: Deleting the active document SHALL not strand the editor surface
The system SHALL pick a fallback document and load its content into the editor whenever the active document is deleted, or clear the editor if no fallback exists.

#### Scenario: Deleting the active document with siblings in the same project
- **GIVEN** the active document is `doc-1` inside `project-X` and `project-X` also contains `doc-2`
- **WHEN** the user deletes `doc-1`
- **THEN** `doc-2` becomes the active document and its content is shown in the editor
- **AND** the sidebar marks `doc-2` as active

#### Scenario: Deleting the active document with no other documents anywhere
- **GIVEN** the active document is the only document in the store
- **WHEN** the user deletes it
- **THEN** the editor content becomes an empty string
- **AND** `activeDocumentId` becomes `null`
- **AND** no console error or React warning is raised

### Requirement: Empty `projectId` strings SHALL be normalized to `undefined`
The system SHALL coerce a falsy `projectId` argument to `undefined` when creating a document so that "unfiled" documents have a single canonical representation across local state and Supabase.

#### Scenario: Creating a document with no selected project
- **GIVEN** the projects array is empty
- **WHEN** the user creates a document via the sidebar
- **THEN** the resulting document row has `projectId: undefined` (not `""`)
- **AND** the document appears under the "Unfiled" section
- **AND** the Supabase row (when applicable) stores `project_id: NULL`
