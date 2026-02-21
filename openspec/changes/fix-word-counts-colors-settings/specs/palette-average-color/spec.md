## ADDED Requirements

### Requirement: Custom palette swatch shows average of highlight colors
The custom palette swatch circle in the ThemeSelector SHALL display the computed average color of all 9 highlight colors in the palette, not the background override or base accent.

#### Scenario: Palette with diverse highlight colors
- **WHEN** a custom palette has highlight colors spanning blue, red, green, etc.
- **THEN** the swatch SHALL display the RGB average of all 9 highlight colors
- **AND** the palette data SHALL NOT be modified (display-only computation)

#### Scenario: Palette with no highlight overrides
- **WHEN** a custom palette has no highlight color overrides
- **THEN** the swatch SHALL display the average of the base theme's highlight colors

#### Scenario: Palette with partial highlight overrides
- **WHEN** a custom palette overrides 3 of 9 highlight colors
- **THEN** the swatch SHALL compute average using overridden colors for those 3 and base theme colors for the remaining 6
