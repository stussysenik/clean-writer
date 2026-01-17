# Project Context

## Purpose
Clean Writer is a distraction-free writing app that helps users see their text differently through **programmatic syntax visualization**. It highlights parts of speech in real-time, creating a unique textual-color experience for writers.

## Tech Stack
- **Frontend:** React 19, TypeScript
- **Build:** Vite + vite-plugin-pwa
- **Styling:** Tailwind CSS
- **NLP:** Compromise.js (local, offline)
- **Testing:** Playwright (e2e)
- **PWA:** Workbox for offline support

## Project Conventions

### Code Style
- Functional React components with hooks
- TypeScript strict mode
- Tailwind for styling (no CSS modules)
- Components extracted by single responsibility

### Architecture Patterns
- Feature-based component structure
- Custom hooks for reusable logic (`useTouch`, `useCustomTheme`)
- LocalStorage for persistence
- Service layer for NLP analysis

### Testing Strategy
- Playwright for e2e testing
- Multi-device coverage (desktop, mobile, tablet)
- PWA installability tests

### Git Workflow
- Main branch for production
- Conventional commits with co-author attribution
- Feature branches for large changes

## Domain Context
- **Typewriter Mode:** Forward-only typing (no backspace) for focused writing
- **Syntax Highlighting:** Real-time part-of-speech coloring
- **Themes:** Preset + fully customizable color schemes
- **PWA:** Installable on iOS/Android home screens

## Important Constraints
- Must work offline (PWA requirement)
- 44px minimum tap targets for mobile
- No external API calls for NLP (uses Compromise.js locally)
- Text persists in localStorage

## External Dependencies
- Google Fonts (cached by service worker)
- Compromise.js (bundled, no network required)
