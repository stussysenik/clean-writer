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
| **Syntax Highlighting** | Nouns/verbs/adjectives + URLs, numbers, hashtags (Web Worker, O(1) lookups) |
| **Theme Presets** | Classic, Blueprint, Midnight, Paper, Sepia, Terminal, Ocean, Forest, Flexoki |
| **Markdown Preview** | Toggle with eye icon |
| **Strikethrough** | Select text → click ~~S~~ button |
| **Export** | Download as `.md` file |
| **PWA** | Install on iOS/Android home screen |
| **Offline** | Works without internet |
| **Responsive** | Mobile-friendly with side panel for syntax controls |
| **Harmonica Gesture** | Single continuous drag on mobile (40px→Peek→120px→Expand→220px→Full) |
| **UTF Support** | UTF-aware word counting + optional emoji code display (`U+...`) |
| **Quick Stats** | Dedicated counters for URLs, numbers, hashtags with collapsible grid |
| **Build Identity** | Build label + wordism in settings and panel footer for local/prod matching |
| **Collapsible Breakdown** | Toggle word type list with colored indicator |
| **Golden Ratio Spacing** | φ-based spacing (8→13→21→34→55→89px) for harmonious layouts |
| **Theme-Aware UI** | All buttons/controls adapt to light/dark themes |

## Keyboard

- **Type** → Characters append to end
- **Enter** → New line
- **Backspace** → Disabled (typewriter mode)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
```

## Build Identity

The UI shows a deployment-friendly identity, not commit SHA:

- `Build vX.Y.Z · <track>` in settings and syntax panel footer
- `X.Y.Z` comes from `package.json` by default, or `VITE_APP_VERSION`
- `<track>` comes from `VITE_BUILD_TRACK` (falls back to Vite mode)

This makes local vs Vercel verification straightforward.

## Themes

Click colored circles (top-right) to switch. Theme visibility can be customized in settings.

## Files

```
├── App.tsx              # Main app component
├── components/
│   ├── Typewriter.tsx   # Editor with syntax highlighting
│   ├── MarkdownPreview.tsx
│   ├── Toolbar/         # Extracted toolbar components
│   ├── UnifiedSyntaxPanel/
│   │   ├── HarmonicaContainer.tsx  # 3-stage accordion
│   │   ├── CornerFoldTab.tsx       # Drag handle
│   │   └── DesktopSyntaxPanel.tsx  # Desktop variant
│   └── TouchButton.tsx  # Mobile-friendly button
├── hooks/
│   ├── useTouch.ts          # Touch/haptic feedback hook
│   └── useHarmonicaDrag.ts  # 3-stage drag state machine
├── constants/
│   ├── index.ts             # Theme definitions
│   └── spacing.ts           # Golden ratio spacing system
├── constants.ts         # Theme definitions (legacy)
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
