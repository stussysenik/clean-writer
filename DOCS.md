# Clean Typewriter Experience Documentation

Complete documentation for Clean Typewriter Experience - a distraction-free writing app with syntax highlighting, customizable themes, and PWA support.

---

## Table of Contents

1. [Installation](#installation)
2. [Architecture](#architecture)
3. [Theme System](#theme-system)
4. [Font Options](#font-options)
5. [Word Type Highlighting](#word-type-highlighting)
6. [Components](#components)
7. [Hooks](#hooks)
8. [PWA Configuration](#pwa-configuration)
9. [Testing](#testing)
10. [Mobile Support](#mobile-support)
11. [Keyboard Shortcuts](#keyboard-shortcuts)

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
├── constants.ts               # Theme & font definitions
├── types.ts                   # TypeScript interfaces
│
├── components/
│   ├── Typewriter.tsx         # Main editor component
│   ├── MarkdownPreview.tsx    # Markdown renderer
│   ├── ConfirmDialog.tsx      # Modal dialog
│   ├── TouchButton.tsx        # Mobile-friendly button
│   ├── Tooltip.tsx            # Hover/focus tooltip
│   ├── UnifiedSyntaxPanel/
│   │   ├── index.tsx          # Panel orchestrator
│   │   ├── HarmonicaContainer.tsx # 3-stage accordion
│   │   ├── CornerFoldTab.tsx  # Drag handle with affordances
│   │   ├── DesktopSyntaxPanel.tsx # Desktop variant
│   │   ├── PanelBody.tsx      # Full panel content
│   │   └── FoldContainer.tsx  # Animation wrapper
│   └── Toolbar/
│       ├── index.tsx          # Toolbar composition
│       ├── Icons/index.tsx    # Radix UI icon components
│       ├── SyntaxToggles.tsx  # POS highlight toggles
│       ├── SyntaxLegend.tsx   # Word type legend modal
│       ├── ActionButtons.tsx  # Action buttons
│       ├── ThemeSelector.tsx  # Theme picker
│       └── WordCount.tsx      # Word counter
│
├── hooks/
│   ├── useTouch.ts            # Touch/haptic/long-press
│   ├── useHarmonicaDrag.ts    # 3-stage drag state machine
│   ├── useCustomTheme.ts      # Theme customization hook
│   └── useResponsiveBreakpoint.ts # Desktop/mobile detection
│
├── utils/
│   └── colorContrast.ts       # WCAG contrast utilities
│
├── services/
│   └── localSyntaxService.ts  # NLP syntax analysis
│
├── public/
│   ├── favicon.svg
│   ├── favicon.ico            # .ico fallback
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
    pronoun: string;
    verb: string;
    adjective: string;
    adverb: string;
    preposition: string;
    conjunction: string;
    article: string;
    interjection: string;
  };
  accent: string;         // Primary accent
  cursor: string;         // Blinking cursor color
  strikethrough: string;  // Strikethrough decoration
  selection: string;      // Text selection (rgba)
}
```

### Available Themes (10 Total)

| Theme | Background | Text | Accent | Vibe |
|-------|------------|------|--------|------|
| Classic | #FDFBF7 | #333333 | #F15060 | Warm paper |
| Blueprint | #0078BF | #FDFBF7 | #FFE800 | Technical |
| Midnight | #1a1a2e | #e8e8e8 | #00d9ff | Dark purple |
| Sepia | #f4ecd8 | #5c4b37 | #8b6914 | Vintage |
| Ink | #0d0d0d | #f5f5f5 | #ff6b6b | High contrast |
| Paper | #FFFFFF | #1A1A1A | #2563EB | Pure minimal |
| Terminal | #0C0C0C | #00FF00 | #00FF00 | Hacker/dev |
| Warmth | #FFF8F0 | #4A3728 | #D97706 | Cozy warm |
| Ocean | #0F172A | #E2E8F0 | #38BDF8 | Deep calm |
| Forest | #1A2F1A | #D4E5D4 | #4ADE80 | Nature green |

### Color Contrast

All theme colors are validated to meet minimum 2.08:1 contrast ratio against their background. The ThemeCustomizer shows warnings for custom colors that fail this threshold.

### Dynamic Theme Updates

Theme changes trigger:
1. `--selection-color` CSS variable update
2. `<meta name="theme-color">` update (for PWA)
3. LocalStorage persistence

---

## Font Options

### Available Fonts

| Font | Style | Best For |
|------|-------|----------|
| Courier Prime | Monospace serif | Classic typewriter feel |
| Space Mono | Monospace | Modern coding |
| JetBrains Mono | Monospace | Programming |
| Inter | Sans-serif | Clean reading |
| System | System default | Native feel |

Fonts are loaded via Google Fonts and cached by the service worker for offline use.

### Persistence

Font selection is saved to `clean_writer_font` in LocalStorage.

---

## Word Type Highlighting

### Content Words (1-4)

| # | Type | Icon | Purpose |
|---|------|------|---------|
| 1 | Nouns | Cube | Objects/things |
| 2 | Verbs | Lightning | Actions |
| 3 | Adjectives | Mix | Descriptors |
| 4 | Adverbs | Timer | How/when |

### Function Words (5-9)

| # | Type | Icon | Purpose |
|---|------|------|---------|
| 5 | Pronouns | Person | References |
| 6 | Prepositions | Move | Position |
| 7 | Conjunctions | Link | Connectors |
| 8 | Articles | Text | Determiners |
| 9 | Interjections | Chat | Expressions |

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

Mobile-friendly button with haptic feedback and long-press support:

```tsx
<TouchButton
  onClick={handleClick}
  onLongPress={handleLongPress}
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
- Long-press detection (500ms)

### Tooltip

Hover tooltip with keyboard shortcut display:

```tsx
<Tooltip content="Nouns" shortcut="1">
  <Button />
</Tooltip>
```

### HarmonicaContainer

Mobile 3-stage accordion panel with glassmorphism:

```tsx
<HarmonicaContainer
  theme={theme}
  stage={harmonicaState.stage}
  isDragging={harmonicaState.isDragging}
  dragProgress={harmonicaState.dragProgress}
  reducedMotion={false}
>
  {{
    tab: <CornerFoldTab {...} />,
    peek: <WordCountPreview />,
    expand: <BreakdownHeader />,
    full: <PanelBody {...} />,
  }}
</HarmonicaContainer>
```

**Features:**
- Glassmorphism with `backdrop-filter: blur(10px)`
- Paper grain texture overlay
- GSAP spring animations with overshoot
- Visual resistance feedback during drag

---

## Hooks

### useHarmonicaDrag

Unified horizontal drag state machine for mobile panel reveal:

```typescript
const {
  state: { stage, isDragging, dragProgress, dragDirection },
  handlers: { onDragStart, onDragMove, onDragEnd },
  setStage,
  close,
} = useHarmonicaDrag({
  reducedMotion: false,
  onStageChange: (stage) => console.log(stage),
});
```

**Stages (Single Continuous Drag):**

| Stage | Cumulative Distance | Snap Boundary | Content Revealed |
|-------|---------------------|---------------|------------------|
| `closed` | 0px | <20px | Tab with word count |
| `peek` | 40px | 20-80px | Word count preview |
| `expand` | 120px | 80-170px | Breakdown header |
| `full` | 220px | >170px | Complete panel |

**Features:**
- Unified horizontal drag direction (always left)
- One continuous motion from closed to full
- Snap-to-nearest stage on release
- GSAP spring animation with overshoot (`back.out(1.2)`)
- Haptic feedback at stage boundaries

### useTouch

Touch event handler with haptic feedback and long-press:

```typescript
const handlers = useTouch({
  onTap: () => console.log('tapped'),
  onLongPress: () => console.log('long pressed'),
  hapticFeedback: 'light',
  longPressDelay: 500,
});
```

**Haptic Patterns:**
- `light`: 10ms vibration
- `medium`: 20ms vibration
- `heavy`: 40ms vibration

### useCustomTheme

Theme customization with color overrides:

```typescript
const {
  effectiveTheme,
  hasCustomizations,
  setColor,
  resetToPreset,
} = useCustomTheme(themeId);
```

---

## Word Counting

### UTF-8 Support

The `countWords()` function handles international text:

| Text Type | Counting Method |
|-----------|-----------------|
| Latin/Western | Whitespace-separated words |
| CJK (Chinese, Japanese, Korean) | Each character = 1 word |
| Emoji | Each emoji = 1 word |
| Mixed content | Hybrid counting |

**Examples:**
- `"Hello world"` → 2 words
- `"你好世界"` → 4 words (4 CJK characters)
- `"Hello 你好 😀"` → 4 words (1 English + 2 CJK + 1 emoji)

**Implementation:**
- Uses `Intl.Segmenter` API when available (modern browsers)
- Falls back to regex-based counting for older browsers

---

## PWA Configuration

### Manifest (vite.config.ts)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'clean typewriter experience',
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
<meta name="apple-mobile-web-app-title" content="Clean Typewriter" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### Favicon Setup

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
npm run test              # All 151 tests, headless
npm run test:ui           # Interactive UI
npm run test:headed       # Headed browsers
```

### Test Suite Overview

| File | Tests | Category |
|------|-------|----------|
| `core-mechanics.spec.ts` | 17 | Append-only typing, backspace disabled, strikethrough |
| `syntax-analysis.spec.ts` | 20 | NLP word detection, category counts, highlighting |
| `responsive-paradigm.spec.ts` | 19 | Desktop/mobile mutual exclusivity at 1024px |
| `state-persistence.spec.ts` | 22 | localStorage, content recovery, theme persistence |
| `motion-design.spec.ts` | 20 | Glassmorphism, GSAP animations, cursor color |
| `mobile-paradigm.spec.ts` | 27 | Touch targets, virtual keyboard, fold-tab |
| `desktop-paradigm.spec.ts` | 26 | Always-visible panel, hover effects, toggles |
| `responsive.spec.ts` | varies | Breakpoint behavior |
| `theme-switching.spec.ts` | varies | Theme application, persistence |
| `responsive-syntax-panel.spec.ts` | varies | Panel responsive behavior |
| `mobile-touch.spec.ts` | varies | Touch interaction |

### Testing Patterns

**Append-Only Textarea:**
```typescript
// Don't use fill() - it clears content
// Use click() + pressSequentially() instead
await textarea.click();
await textarea.pressSequentially('hello', { delay: 10 });
```

**Bypassing Element Interception:**
```typescript
// Mobile fold-tab may have overlay blocking clicks
await foldTab.evaluate(el => el.click());
```

**Exact Text Matching:**
```typescript
// "Nouns" would match both "Nouns" and "Pronouns"
await panel.getByText('Nouns', { exact: true });
```

**Data-testid Attributes:**
- `desktop-syntax-panel` - Desktop left panel (≥1024px)
- `mobile-fold-tab` - Mobile right fold-tab (<1024px)
- `ghost-cursor` - Blinking cursor in typewriter
- `strikethrough-btn` - Strikethrough toolbar button

### Critical Test Assertions

```typescript
// Desktop: left panel ONLY, no mobile fold-tab
test('Desktop shows left panel only', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('[data-testid="desktop-syntax-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="mobile-fold-tab"]')).toHaveCount(0);
});

// Mobile: right fold-tab ONLY, no desktop panel
test('Mobile shows fold-tab only', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('[data-testid="mobile-fold-tab"]')).toBeVisible();
  await expect(page.locator('[data-testid="desktop-syntax-panel"]')).toHaveCount(0);
});

// Glassmorphism verification
test('Panel has backdrop blur', async ({ page }) => {
  const panel = page.locator('[data-testid="desktop-syntax-panel"]');
  const backdropFilter = await panel.evaluate(el =>
    getComputedStyle(el).backdropFilter
  );
  expect(backdropFilter).toContain('blur(10px)');
});
```

### Device Coverage

- Desktop Chrome
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

---

## Mobile Support

### Harmonica Gesture (Mobile Panel)

The mobile syntax panel uses a unified horizontal drag gesture - one satisfying continuous motion:

| Distance | Stage | Content |
|----------|-------|---------|
| 0-40px | Peek | Word count preview |
| 40-120px | Expand | Breakdown header |
| 120-220px | Full | Complete panel |

**Features:**
- Single drag direction (always left) - no direction changes
- Snap-to-nearest stage on release (boundaries at 20px, 80px, 170px)
- Spring animation with overshoot on snap
- Haptic feedback at stage boundaries

### Touch Targets

All interactive elements have:
- Minimum 44x44px tap area
- `touch-action: manipulation`
- Haptic feedback (where supported)
- Long-press detection for tooltips

### Responsive Breakpoints

| Breakpoint | Font Size | Syntax Toggles | Side Panel |
|------------|-----------|----------------|------------|
| < 768px | 18px | Hidden (use side panel) | Pulsing hint for first-time users |
| ≥ 768px | 24px | Full toolbar visible | Available |

### Theme Selector

- Mobile: 24x24px circles (wraps to 2 rows)
- Desktop: 20x20px circles

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1 | Toggle Nouns |
| 2 | Toggle Verbs |
| 3 | Toggle Adjectives |
| 4 | Toggle Adverbs |
| 5 | Toggle Pronouns |
| 6 | Toggle Prepositions |
| 7 | Toggle Conjunctions |
| 8 | Toggle Articles |
| 9 | Toggle Interjections |

*Note: Shortcuts only work when not typing in the editor.*

---

## Local Storage

| Key | Description |
|-----|-------------|
| `riso_flow_content` | Document content |
| `riso_flow_max_width` | Editor max-width |
| `clean_writer_theme` | Selected theme ID |
| `clean_writer_font` | Selected font ID |
| `clean_writer_custom_theme` | Custom theme overrides |
| `seen_syntax_panel` | First-visit tracking for side panel |
| `clean_writer_word_type_order` | Custom word type ordering |
| `clean_writer_breakdown_collapsed` | Breakdown section collapsed state |

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

### Low Contrast Warning

If you see "Low contrast" badges in ThemeCustomizer, adjust your colors to meet the 2.08:1 minimum ratio.

---

## Contributing

1. Fork the repo
2. Create feature branch
3. Run tests: `npm run test`
4. Submit PR

---

**[Back to README](./README.md)** | **[Progress Log](./PROGRESS.md)**
