# Clean Writer

A distraction-free writing app with real-time syntax highlighting and PWA support.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Install on Your Phone

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap **Share** → **Add to Home Screen**
3. Done! Works offline.

## Features

| Feature | Description |
|---------|-------------|
| **Typewriter Mode** | Forward-only typing (no backspace) for focused writing |
| **Syntax Highlighting** | Nouns, verbs, adjectives, conjunctions colored |
| **5 Themes** | Classic, Blueprint, Midnight, Sepia, Ink |
| **Markdown Preview** | Toggle with eye icon |
| **Strikethrough** | Select text → click ~~S~~ button |
| **Export** | Download as `.md` file |
| **PWA** | Install on iOS/Android home screen |
| **Offline** | Works without internet |
| **Responsive** | Mobile-friendly with side panel for syntax controls |
| **UTF-8 Support** | Chinese, Japanese, Korean, and emoji word counting |
| **Collapsible Breakdown** | Toggle word type list in syntax panel |

## Keyboard

- **Type** → Characters append to end
- **Enter** → New line
- **Backspace** → Disabled (typewriter mode)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Playwright tests (151 tests)
npm run test:ui      # Run tests with UI
```

## Test Coverage

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Core Mechanics | 17 | Append-only typing, strikethrough, paste |
| Syntax Analysis | 20 | NLP accuracy, word counts, categories |
| Responsive Paradigm | 19 | Desktop/mobile exclusivity at 1024px |
| State Persistence | 22 | localStorage, themes, recovery |
| Motion Design | 20 | Glassmorphism, GSAP, cursor effects |
| Mobile Paradigm | 27 | Touch targets, keyboard, fold-tab |
| Desktop Paradigm | 26 | Panel visibility, hover effects |
| **Total** | **151** | Full E2E coverage |

## Themes

Click colored circles (top-right) to switch:

- 🔴 **Classic** - Warm paper, red accents
- 🔵 **Blueprint** - Blue background, yellow text
- 🌙 **Midnight** - Dark purple, neon colors
- 📜 **Sepia** - Aged paper aesthetic
- ⬛ **Ink** - Pure black, vibrant highlights

## Files

```
├── App.tsx              # Main app component
├── components/
│   ├── Typewriter.tsx   # Editor with syntax highlighting
│   ├── MarkdownPreview.tsx
│   ├── Toolbar/         # Extracted toolbar components
│   └── TouchButton.tsx  # Mobile-friendly button
├── hooks/
│   └── useTouch.ts      # Touch/haptic feedback hook
├── constants.ts         # Theme definitions
├── types.ts             # TypeScript interfaces
└── tests/e2e/           # Playwright tests
```

## Tech Stack

- React 19 + TypeScript
- Vite + vite-plugin-pwa
- Tailwind CSS
- Playwright (testing)
- Compromise (NLP)

---

**[📖 Full Documentation](./DOCS.md)** | **[📋 Progress Log](./PROGRESS.md)**
