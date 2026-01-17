# Clean Writer Documentation

Complete documentation for Clean Writer - a distraction-free writing app with syntax highlighting and PWA support.

---

## Table of Contents

1. [Installation](#installation)
2. [Architecture](#architecture)
3. [Theme System](#theme-system)
4. [Components](#components)
5. [Hooks](#hooks)
6. [PWA Configuration](#pwa-configuration)
7. [Testing](#testing)
8. [Mobile Support](#mobile-support)

---

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone and install
git clone <repo-url>
cd clean-writer
npm install

# Generate PWA icons
npm run generate-icons

# Start development
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Architecture

### Directory Structure

```
clean-writer/
├── App.tsx                    # Root component
├── index.html                 # Entry point with PWA meta tags
├── index.tsx                  # React mount point
├── index.css                  # Global CSS (selection styling)
├── constants.ts               # Theme definitions
├── types.ts                   # TypeScript interfaces
│
├── components/
│   ├── Typewriter.tsx         # Main editor component
│   ├── MarkdownPreview.tsx    # Markdown renderer
│   ├── ConfirmDialog.tsx      # Modal dialog
│   ├── TouchButton.tsx        # Mobile-friendly button
│   └── Toolbar/
│       ├── index.tsx          # Toolbar composition
│       ├── Icons/index.tsx    # SVG icon components
│       ├── SyntaxToggles.tsx  # POS highlight toggles
│       ├── ActionButtons.tsx  # Action buttons
│       ├── ThemeSelector.tsx  # Theme picker
│       └── WordCount.tsx      # Word counter
│
├── hooks/
│   └── useTouch.ts            # Touch/haptic feedback
│
├── services/
│   └── localSyntaxService.ts  # NLP syntax analysis
│
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
│
├── scripts/
│   └── generate-icons.js      # Icon generator
│
├── tests/e2e/
│   ├── mobile-touch.spec.ts
│   ├── theme-switching.spec.ts
│   ├── pwa-install.spec.ts
│   └── responsive.spec.ts
│
├── vite.config.ts             # Vite + PWA config
└── playwright.config.ts       # Test config
```

### Data Flow

```
User Input → Typewriter → Content State → LocalStorage
                ↓
         Syntax Analysis (Compromise NLP)
                ↓
         Highlighted Render
```

---

## Theme System

### RisoTheme Interface

```typescript
interface RisoTheme {
  id: string;
  name: string;
  text: string;           // Main text color
  background: string;     // Background color
  highlight: {
    noun: string;
    verb: string;
    adjective: string;
    conjunction: string;
  };
  accent: string;         // Primary accent
  cursor: string;         // Blinking cursor color
  strikethrough: string;  // Strikethrough decoration
  selection: string;      // Text selection (rgba)
}
```

### Available Themes

| Theme | Background | Text | Cursor | Selection |
|-------|------------|------|--------|-----------|
| Classic | #FDFBF7 | #333333 | #F15060 | rgba(241,80,96,0.2) |
| Blueprint | #0078BF | #FDFBF7 | #FFE800 | rgba(255,232,0,0.3) |
| Midnight | #1a1a2e | #e8e8e8 | #00d9ff | rgba(0,217,255,0.2) |
| Sepia | #f4ecd8 | #5c4b37 | #8b6914 | rgba(139,105,20,0.2) |
| Ink | #0d0d0d | #f5f5f5 | #ff6b6b | rgba(255,107,107,0.2) |

### Dynamic Theme Updates

Theme changes trigger:
1. `--selection-color` CSS variable update
2. `<meta name="theme-color">` update (for PWA)
3. LocalStorage persistence

---

## Components

### Typewriter

The main editor with forward-only typing:

```tsx
<Typewriter
  content={content}
  setContent={setContent}
  theme={currentTheme}
  syntaxData={syntaxData}
  highlightConfig={highlightConfig}
  fontSize={fontSize}
  maxWidth={maxWidth}
/>
```

**Key Features:**
- Backspace/Delete disabled
- Passive scroll event listener
- Ghost cursor with theme-based color
- Syntax highlighting via backdrop overlay

### TouchButton

Mobile-friendly button with haptic feedback:

```tsx
<TouchButton
  onClick={handleClick}
  hapticFeedback="light" // 'light' | 'medium' | 'heavy'
  className="..."
>
  <Icon />
</TouchButton>
```

**Features:**
- 44px minimum tap target
- `touch-action: manipulation` for fast taps
- Haptic vibration on tap

---

## Hooks

### useTouch

Touch event handler with haptic feedback:

```typescript
const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } = useTouch({
  onTap: () => console.log('tapped'),
  hapticFeedback: 'light',
});
```

**Haptic Patterns:**
- `light`: 10ms vibration
- `medium`: 20ms vibration
- `heavy`: 40ms vibration

---

## PWA Configuration

### Manifest (vite.config.ts)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Clean Writer',
    short_name: 'Writer',
    display: 'standalone',
    theme_color: '#FDFBF7',
    background_color: '#FDFBF7',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [/* Google Fonts caching */]
  }
})
```

### iOS Meta Tags (index.html)

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Clean Writer" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### Icon Generation

```bash
npm run generate-icons
```

Generates:
- `apple-touch-icon.png` (180x180)
- `pwa-192x192.png`
- `pwa-512x512.png`
- `favicon.svg`

---

## Testing

### Run Tests

```bash
npm run test              # All tests, headless
npm run test:ui           # Interactive UI
npm run test:headed       # Headed browsers
```

### Test Suites

| File | Tests |
|------|-------|
| `mobile-touch.spec.ts` | 44px tap targets, touch events, no overlap |
| `theme-switching.spec.ts` | Theme application, persistence, colors |
| `pwa-install.spec.ts` | Manifest, icons, meta tags |
| `responsive.spec.ts` | Font sizes, layout at breakpoints |

### Device Coverage

- Desktop Chrome
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

---

## Mobile Support

### Touch Targets

All interactive elements have:
- Minimum 44x44px tap area
- `touch-action: manipulation`
- Haptic feedback (where supported)

### Responsive Breakpoints

| Breakpoint | Font Size | Layout |
|------------|-----------|--------|
| < 768px | 18px | Vertical toolbar |
| ≥ 768px | 24px | Horizontal toolbar |

### Theme Selector

- Mobile: 24x24px circles
- Desktop: 16x16px circles

---

## Local Storage

| Key | Description |
|-----|-------------|
| `riso_flow_content` | Document content |
| `riso_flow_max_width` | Editor max-width |
| `clean_writer_theme` | Selected theme ID |

---

## Troubleshooting

### PWA Not Installing

1. Must be served over HTTPS (or localhost)
2. Check manifest at `/manifest.webmanifest`
3. Verify icons exist in `/public`

### Fonts Not Loading

Check Google Fonts caching in service worker.

### Tests Failing

```bash
npx playwright install  # Install browsers
npm run dev             # Start dev server
npm run test            # Run tests
```

---

## Contributing

1. Fork the repo
2. Create feature branch
3. Run tests: `npm run test`
4. Submit PR

---

**[← Back to README](./README.md)** | **[📋 Progress Log](./PROGRESS.md)**
