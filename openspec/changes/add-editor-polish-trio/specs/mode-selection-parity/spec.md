## ADDED Requirements

### Requirement: Persisted Selection Overlay Aligns In Writing Mode
The system SHALL render the persisted selection overlay such that the selection background visually covers exactly the glyphs of the selected range when the editor is in writing mode.

#### Scenario: User selects text in writing mode and blurs the textarea
- **GIVEN** the editor is in writing mode
- **AND** the user has made a text selection
- **WHEN** the textarea loses focus and the persisted selection overlay becomes visible
- **THEN** the highlight background covers the selected glyphs with no horizontal or vertical drift
- **AND** unselected glyphs before and after the selection are unaffected

### Requirement: Persisted Selection Overlay Aligns In Song Mode
The system SHALL render the persisted selection overlay in song mode such that the selection background accounts for the rhyme shell geometry used by the song backdrop (`padding: 1px 6px`, `borderRadius: 4px`, and `fontWeight: 700` on focused rhyme tokens).

#### Scenario: User selects rhyming words in song mode
- **GIVEN** the editor is in song mode with rhyme coloring active
- **AND** the user has selected a range that includes at least one rhyme-colored word
- **WHEN** the textarea loses focus and the persisted selection overlay becomes visible
- **THEN** the selection highlight aligns with the rhyme-shell bounding boxes
- **AND** the rhyme-colored backdrop glyphs remain visible through the overlay
- **AND** no horizontal drift is observable at the selection start or end

#### Scenario: User selects a mix of plain and rhyming words in song mode
- **WHEN** the selection spans both plain words and rhyme-group words
- **THEN** plain portions of the selection use the default overlay geometry
- **AND** rhyme-group portions use the shell-matched geometry
- **AND** the transition between the two does not produce visible gaps

### Requirement: Persisted Selection Overlay Aligns In Code Mode
The system SHALL render the persisted selection overlay in code mode such that the selection background accounts for the line-number column prepended by the code backdrop.

#### Scenario: User selects code in code mode
- **GIVEN** the editor is in code mode with Shiki highlighting active
- **AND** the user has selected a range that spans one or more code lines
- **WHEN** the textarea loses focus and the persisted selection overlay becomes visible
- **THEN** each line of the selection overlay includes a non-interactive spacer matching the width of the Shiki line-number column (`2.5em`)
- **AND** the selection highlight aligns with the code glyphs rather than shifting left over the line numbers

#### Scenario: Selected code contains a wrapped long line
- **WHEN** the selection includes a line that wraps because it exceeds the editor width
- **THEN** the selection highlight continues to align with the glyphs on both the first and wrapped visual rows

### Requirement: Default Mode Selection Behaviour Is Unchanged
The system SHALL preserve the existing persisted selection overlay behaviour in writing mode as a non-regression guarantee.

#### Scenario: Writing-mode selection overlay is unchanged after the parity fix
- **GIVEN** the editor is in writing mode
- **WHEN** the user selects text and blurs the textarea
- **THEN** the persisted selection overlay renders identically to the behaviour before this change
- **AND** no additional chrome, spacing, or styling is introduced in writing mode
