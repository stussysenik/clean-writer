## ADDED Requirements

### Requirement: Word type counts reflect occurrences not unique types
The system SHALL count the number of times each classified word appears in the content, not just the number of unique word types. For example, if "the" appears 3 times, articles count SHALL be 3, not 1.

#### Scenario: Multiple occurrences of same word
- **WHEN** content is "the cat and the dog"
- **THEN** articles count SHALL be 2 (two occurrences of "the")
- **AND** nouns count SHALL be 2 (cat, dog)
- **AND** conjunctions count SHALL be 1 (and)

#### Scenario: Empty content
- **WHEN** content is empty or whitespace only
- **THEN** all word type counts SHALL be 0
- **AND** total word count SHALL be 0

### Requirement: Syntax data replaces on each analysis instead of accumulating
The system SHALL replace syntax analysis data entirely on each analysis cycle, not merge with previous results. Words from deleted text MUST NOT persist in the breakdown.

#### Scenario: Word deleted from content
- **WHEN** user has typed "hello world" and syntax shows nouns: 1 (world)
- **AND** user clears text and types "goodbye"
- **THEN** the word "world" SHALL NOT appear in syntax data
- **AND** only words from current content SHALL be counted

#### Scenario: Content fully replaced
- **WHEN** content changes from "the quick brown fox" to "I run fast"
- **THEN** syntax data SHALL reflect only "I run fast"
- **AND** previous words (the, quick, brown, fox) SHALL NOT be counted

### Requirement: Settings gear icon toggles customizer open and closed
The gear icon SHALL toggle the ThemeCustomizer panel. When the customizer is open, tapping the gear SHALL close it. The gear MUST remain accessible (not blocked by backdrop) when the customizer is open.

#### Scenario: Open customizer via gear
- **WHEN** customizer is closed
- **AND** user taps the gear icon
- **THEN** customizer panel SHALL open

#### Scenario: Close customizer via gear
- **WHEN** customizer is open
- **AND** user taps the gear icon
- **THEN** customizer panel SHALL close
- **AND** gear icon MUST be tappable above the backdrop overlay

#### Scenario: Gear icon visual state
- **WHEN** customizer is open
- **THEN** gear icon SHALL visually indicate the open state (rotation or other transform)
