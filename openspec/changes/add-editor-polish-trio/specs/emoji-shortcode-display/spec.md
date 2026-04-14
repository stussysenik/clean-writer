## ADDED Requirements

### Requirement: Shortcode Substitution In Backdrop
The system SHALL substitute known `:shortcode:` tokens with their emoji glyphs in the Typewriter backdrop when the shortcode display toggle is enabled, without mutating the underlying content string.

#### Scenario: User enables shortcode display and types a known shortcode
- **WHEN** the shortcode display toggle is enabled
- **AND** the user types `:smile:` into the textarea
- **THEN** the backdrop renders `😀` in place of `:smile:`
- **AND** the textarea value is exactly `:smile:`
- **AND** the character offset returned by `selectionStart` reflects the raw shortcode, not the emoji

#### Scenario: User types an unknown shortcode
- **WHEN** the shortcode display toggle is enabled
- **AND** the user types `:notarealshortcode:`
- **THEN** the backdrop renders `:notarealshortcode:` verbatim
- **AND** no substitution is attempted

#### Scenario: User disables the toggle after typing shortcodes
- **WHEN** the user has typed `:smile:` with the toggle enabled
- **AND** the user disables the shortcode display toggle
- **THEN** the backdrop renders `:smile:` verbatim
- **AND** the textarea value has not changed

### Requirement: Toggle Persistence
The system SHALL persist the shortcode display toggle state across browser sessions using localStorage.

#### Scenario: Toggle state survives reload
- **WHEN** the user enables the shortcode display toggle
- **AND** the user refreshes the page
- **THEN** the toggle remains enabled on load
- **AND** the backdrop continues to substitute known shortcodes

### Requirement: Mutual Exclusivity With UTF Code Display
The system SHALL ensure the shortcode display toggle and the UTF code display toggle cannot both be enabled at the same time.

#### Scenario: Enabling shortcodes disables UTF codes
- **GIVEN** the UTF code display toggle is enabled
- **WHEN** the user enables the shortcode display toggle
- **THEN** the UTF code display toggle becomes disabled
- **AND** only the shortcode substitution is applied to the backdrop

#### Scenario: Enabling UTF codes disables shortcodes
- **GIVEN** the shortcode display toggle is enabled
- **WHEN** the user enables the UTF code display toggle
- **THEN** the shortcode display toggle becomes disabled
- **AND** only the UTF code substitution is applied to the backdrop

### Requirement: Shortcode Substitution Inside Strikethrough
The system SHALL apply shortcode substitution to text inside strikethrough blocks (`~~...~~`) using the same rule as regular text.

#### Scenario: Strikethrough block contains a shortcode
- **WHEN** the user types `~~:smile: crossed~~` with shortcode display enabled
- **THEN** the backdrop renders `😀 crossed` with the strikethrough decoration
- **AND** the textarea value remains `~~:smile: crossed~~`
