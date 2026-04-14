## ADDED Requirements

### Requirement: Total Document Counts Accessible From Toolbar
The system SHALL expose total document word count and character count as a quick-access affordance from the existing toolbar chars button, without requiring the sidebar to be open.

#### Scenario: Writer hovers the chars button with no selection
- **GIVEN** the user has written at least one word in the document
- **AND** no text is currently selected
- **WHEN** the user hovers the chars button in the toolbar
- **THEN** the tooltip includes the total document word count and character count formatted as `{wordCount} words · {charCount} characters`
- **AND** the tooltip continues to convey the existing "Show/Hide character counts per paragraph" action label

#### Scenario: Writer hovers the chars button with an active selection
- **GIVEN** the user has an active text selection
- **WHEN** the user hovers the chars button in the toolbar
- **THEN** the tooltip shows both the selection counts and the total document counts
- **AND** the selection counts are visually distinct from the total counts in the tooltip body

#### Scenario: Writer has an empty document
- **GIVEN** the document is empty
- **WHEN** the user hovers the chars button
- **THEN** the tooltip shows `0 words · 0 characters` as the total counts line
- **AND** no selection counts are shown

### Requirement: Quick Tool Does Not Add New Chrome
The system SHALL surface total counts through the existing chars button tooltip and SHALL NOT introduce a new persistent toolbar button, footer pill, or other always-visible count affordance.

#### Scenario: No new visible chrome appears after the quick tool lands
- **WHEN** the user opens the editor after this change is applied
- **THEN** the toolbar contains the same button count as before
- **AND** the footer, sidebar, and writing area contain no new persistent count displays
- **AND** total counts are only visible on-demand via the chars button tooltip

### Requirement: Feedback Submission Context Retains Counts
The system SHALL continue to include total document word count and character count in the context attached to submitted feedback notes, matching the behaviour in place before this change.

#### Scenario: User submits a feedback note after the quick tool lands
- **WHEN** the user submits a feedback note via the sidebar
- **THEN** the submitted context object includes `wordCount` and `charCount` fields reflecting the total document counts
- **AND** the values match what the toolbar tooltip displays
