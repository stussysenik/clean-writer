## ADDED Requirements

### Requirement: Fluid editor typography using CSS clamp
The main editor textarea and backdrop SHALL use CSS `clamp()` for font-size instead of discrete breakpoint jumps, providing smooth scaling between 18px (mobile minimum) and 24px (desktop maximum).

#### Scenario: Font size on iPhone (390px)
- **WHEN** the editor is rendered on a 390px viewport
- **THEN** the font-size SHALL be 18px

#### Scenario: Font size on iPad Pro (1024px)
- **WHEN** the editor is rendered on a 1024px viewport
- **THEN** the font-size SHALL be approximately 21px (intermediate between 18 and 24)

#### Scenario: Font size on Desktop (1280px+)
- **WHEN** the editor is rendered on a 1280px viewport
- **THEN** the font-size SHALL be 24px

### Requirement: Proportional spacing for iPad intermediate viewport
The app layout SHALL use intermediate golden ratio spacing values at the `md:` (768px) breakpoint, providing proportional sizing between mobile and desktop rather than a binary jump at 1024px.

#### Scenario: iPad Pro padding
- **WHEN** the app is rendered on a 1024px viewport
- **THEN** horizontal padding SHALL be 21px (golden md) at the `md:` breakpoint
- **AND** vertical padding SHALL be 34px (golden lg) at the `md:` breakpoint

#### Scenario: Desktop padding
- **WHEN** the app is rendered on a ≥1280px viewport
- **THEN** horizontal padding SHALL be 34px (golden lg) at the `lg:` breakpoint
- **AND** the top margin SHALL be 89px (golden xxl)

### Requirement: Responsive text runs E2E tests across all device profiles
All existing E2E tests SHALL continue to pass across Desktop Chrome, Desktop Safari, Mobile Chrome, Mobile Safari, and iPad Pro device profiles without modification to test assertions.

#### Scenario: No test regressions
- **WHEN** the full E2E test suite is run
- **THEN** all previously passing tests SHALL continue to pass
- **AND** font-size assertions in tests SHALL accommodate clamp() computed values
