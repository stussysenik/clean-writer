# UI Polish - iA Writer Inspired Minimalism

## Summary

Transform Clean Writer into an iA Writer-inspired, distraction-free writing app with curated theme presets, persistent preferences, and a super clean, intentional interface.

**Design Philosophy:** Minimal chrome, focus on content, typewriter-like experience, ownership of tools.

---

## Requirements

### REQ-001: Theme Persistence
The system SHALL persist the user's theme selection to browser localStorage.

#### Scenario: Theme persists across sessions
- WHEN the user selects a theme
- THEN the selection is saved to localStorage
- AND when the app reloads, the same theme is restored

#### Scenario: Fallback to default
- WHEN localStorage is empty or contains invalid theme ID
- THEN the Classic theme is used as default

### REQ-002: Curated Theme Presets
The system SHALL provide 5 curated theme presets.

| Theme | Background | Text | Accent | Vibe |
|-------|------------|------|--------|------|
| Classic | #FDFBF7 | #333333 | #F15060 | Light, warm |
| Blueprint | #0078BF | #FDFBF7 | #FFE800 | Bold, creative |
| Midnight | #1a1a2e | #e8e8e8 | #00d9ff | Dark, focused |
| Sepia | #f4ecd8 | #5c4b37 | #8b6914 | Warm, classic |
| Ink | #0d0d0d | #f5f5f5 | #ff6b6b | Pure dark mode |

#### Scenario: User selects theme
- WHEN the user clicks a theme circle
- THEN the interface updates to that theme's colors immediately
- AND syntax highlighting colors update to match the theme

### REQ-003: Minimal Interface
The system SHALL present a distraction-free writing interface.

#### Scenario: Toolbar clarity
- WHEN the user views the toolbar
- THEN only essential controls are visible (Eye, Strike, Export, Trash, Width)
- AND each control has a clear, single purpose
- AND no visual dividers clutter the interface

#### Scenario: Auto-analysis
- WHEN the user types content
- THEN syntax analysis happens automatically in the background
- AND no manual "Analyze" button is needed

### REQ-004: Refined Visual Hierarchy
The system SHALL use visual hierarchy to emphasize content over chrome.

#### Scenario: Theme selector
- WHEN the user views theme options
- THEN circles are small (4x4) and unobtrusive
- AND the current theme has a subtle ring indicator

#### Scenario: POS toggle icons
- WHEN the user views syntax toggle buttons
- THEN icons are small (12x12) and tightly grouped
- AND active toggles are at full opacity
- AND inactive toggles are dimmed

---

## Implementation Notes

### Files Changed
- `constants.ts`: Added 3 new theme presets, THEME_STORAGE_KEY constant
- `App.tsx`: Theme persistence, removed Analyze button, simplified toolbar

### Verification Checklist
- [ ] Select Midnight theme, refresh -> Midnight persists
- [ ] Close tab, reopen -> selected theme restored
- [ ] Clear localStorage -> defaults to Classic
- [ ] All 5 theme circles visible and tappable on mobile
- [ ] Toolbar is clean with no visual clutter
- [ ] All buttons functional
