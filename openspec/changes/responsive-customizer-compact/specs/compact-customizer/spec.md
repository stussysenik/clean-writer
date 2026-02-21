## ADDED Requirements

### Requirement: Customizer fits within 2 scrolls on mobile
The ThemeCustomizer panel SHALL render all content within ≤1.5× the viewport height on a 390×844 viewport (iPhone 12), requiring no more than 2 scrolls to view all sections.

#### Scenario: Mobile viewport scroll measurement
- **WHEN** the customizer is opened on a 390×844 viewport
- **THEN** the panel's scrollHeight SHALL be ≤1300px (1.5× of 868px client height)

### Requirement: Visible Presets section appears first
The Visible Presets section (theme visibility toggles) SHALL be the first content section after the header, before Font and Color sections.

#### Scenario: Section ordering on open
- **WHEN** the customizer is opened
- **THEN** the first section below the header SHALL be "Visible Presets"
- **AND** the section order SHALL be: Visible Presets → Font → Base Colors → Word Type Colors → Save as Palette → Reset

### Requirement: Font section is collapsible
The Font section SHALL default to a collapsed state showing only the currently selected font. Tapping the section SHALL expand to reveal all 6 font options.

#### Scenario: Font section collapsed by default
- **WHEN** the customizer is opened
- **THEN** only the selected font name and preview text SHALL be visible
- **AND** the remaining 5 font options SHALL be hidden

#### Scenario: Font section expands on tap
- **WHEN** the user taps the collapsed font section
- **THEN** all 6 font options SHALL become visible
- **AND** tapping again SHALL collapse back to showing only the selected font

### Requirement: Compact color row layout
Each color setting (Background, Text, Cursor, and 9 word types) SHALL use a compact inline layout: label, color well (32×32px), hex input, and optional reset button on a single row without preset swatch buttons visible by default.

#### Scenario: Color row dimensions
- **WHEN** a color row is rendered on mobile
- **THEN** each row SHALL be ≤44px tall
- **AND** the row SHALL contain: label text, a 32×32px native color well, a hex input, and a reset icon

#### Scenario: Preset swatches accessible on demand
- **WHEN** the user taps a color well in the compact layout
- **THEN** the native color picker SHALL open for direct color selection

### Requirement: Word type colors in a compact grid
The 9 word type color settings SHALL be rendered in a multi-column grid layout (3 columns on mobile, adapting to available width) instead of a single-column vertical list.

#### Scenario: 3-column grid on mobile
- **WHEN** the word type colors section is rendered on a 390px viewport
- **THEN** word types SHALL be arranged in a 3-column grid
- **AND** each cell SHALL show a colored dot, truncated label, and a color well

#### Scenario: Grid adapts to wider viewports
- **WHEN** the word type colors section is rendered on a viewport ≥768px
- **THEN** the grid MAY use more columns or wider cells as space permits

### Requirement: Base colors use compact row layout
The 3 base color settings (Background, Text, Cursor) SHALL each render as a compact inline row with label, color well, hex input, and reset button.

#### Scenario: Base colors compact rendering
- **WHEN** the Base Colors section is rendered
- **THEN** all 3 color rows SHALL fit within ~140px total height
