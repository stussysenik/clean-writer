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
11. [Song Mode](#song-mode)
12. [Build Identity & Deployment](#build-identity--deployment)
13. [Golden Ratio Spacing](#golden-ratio-spacing)
14. [Keyboard Shortcuts](#keyboard-shortcuts)

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
│   ├── colorContrast.ts       # WCAG contrast utilities
│   ├── syntaxPatterns.ts      # URL/number/hashtag matching + token normalization
│   └── emojiUtils.ts          # Emoji to UTF codepoint rendering
│
├── services/
│   └── localSyntaxService.ts  # NLP syntax analysis
│
├── workers/
│   └── syntaxWorker.ts        # Background syntax analysis worker
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
    url: string;
    number: string;
    hashtag: string;
  };
  accent: string;         // Primary accent
  cursor: string;         // Blinking cursor color
  strikethrough: string;  // Strikethrough decoration
  selection: string;      // Text selection (rgba)
}
```

### Available Themes (11 Total)

| Theme | Background | Text | Accent | Vibe |
|-------|------------|------|--------|------|
| Classic | #FDFBF7 | #333333 | #F15060 | Warm paper |
| Blueprint | #0078BF | #FDFBF7 | #FFE800 | Technical |
| Midnight | #1a1a2e | #e8e8e8 | #00d9ff | Dark purple |
| Sepia | #f4ecd8 | #5c4b37 | #8b6914 | Vintage |
| Paper | #FFFFFF | #1A1A1A | #2563EB | Pure minimal |
| Terminal | #0C0C0C | #00FF00 | #00FF00 | Hacker/dev |
| Warmth | #FFF8F0 | #4A3728 | #D97706 | Cozy warm |
| Ocean | #0F172A | #E2E8F0 | #38BDF8 | Deep calm |
| Forest | #1A2F1A | #D4E5D4 | #4ADE80 | Nature green |
| Flexoki Light | #FFFCF0 | #100F0F | #205EA6 | Accessible IDE |
| Flexoki Dark | #100F0F | #FFFCF0 | #4385BE | Accessible IDE |

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

### Quick Stats Extras

| Type | Source | Notes |
|------|--------|-------|
| URLs | Regex extraction | Counted separately from lexical categories |
| Numbers | Regex extraction | Handles decimals, separators, and units |
| Hashtags | Unicode-aware regex | Independent counter + dedicated highlight color |

**Interactions:**

| Action | Effect |
|--------|--------|
| **Single click** | Toggle category highlighting on/off |
| **Double-click** | Solo mode — only this category highlighted |
| **Hover** | Preview — category's words glow in editor |

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
- Optional UTF emoji display mode (`U+...`) without mutating stored content

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
- `desktop-syntax-panel` - Desktop right panel (≥1024px)
- `mobile-fold-tab` - Mobile right fold-tab (<1024px)
- `ghost-cursor` - Blinking cursor in typewriter
- `strikethrough-btn` - Strikethrough toolbar button

### Critical Test Assertions

```typescript
// Desktop: right panel ONLY, no mobile fold-tab
test('Desktop shows right panel only', async ({ page }) => {
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

### Locked Selection Overlay

When mobile focus is lost (for example keyboard collapse or toolbar tap), the last non-empty selection is preserved and rendered as a frozen visual highlight until an action uses it (such as strikethrough) or the user intentionally replaces/clears the selection.

### Quick Stats Behavior

- Quick stats label stays clean (`Quick Stats`) with no `(All Zero)` suffix
- Section is collapsed by default when URL/number/hashtag counts are all zero
- A single tap/click toggles open/close

### Responsive Breakpoints

| Breakpoint | Font Size | Side Panel Behavior |
|------------|-----------|---------------------|
| < 1024px | Fluid clamp | Harmonica fold-tab / drag stages |
| ≥ 1024px | Fluid clamp | Persistent desktop panel |

### Theme Selector

- Mobile: 24x24px circles (wraps to 2 rows)
- Desktop: 20x20px circles

---

## Song Mode

Song Mode provides rhyme and syllable analysis for lyrics and poetry. Toggle it via the **Song** pill button in the panel header.

### Quick Counts Grid

Three-column summary at the top of the song section:

| Metric | Source |
|--------|--------|
| Syllables | Total syllable count across all lines |
| Lines | Non-empty line count |
| Rhymes | Number of distinct rhyme groups |

### Rhyme Scheme Display

Shows the detected rhyme pattern as colored letters (e.g., **AABBA**) with a label:

| Pattern | Label |
|---------|-------|
| AABB | Couplets |
| ABAB | Alternating |
| ABBA | Enclosed |
| AAAA | Monorhyme |
| Mixed | Free Verse |

Each letter is colored to match its rhyme group.

### Rhyme Groups

Lists each rhyme group with:
- Color dot matching the rhyme palette
- Up to 5 example words ("+N" if more)
- Count badge
- Approximate marker (~) when rhyme was detected via suffix heuristic rather than CMU dictionary

Sorted by group size (largest first). Only groups with 2+ unique words are shown.

**Interactions (mirrors word type model):**

| Action | Effect |
|--------|--------|
| **Hover** | Temporary preview — group's words brighten in editor |
| **Single click** | Toggle group highlighting on/off |
| **Double-click** | Solo mode — only this group visible, all others dimmed |

Visual states:
- **Disabled** (toggled off): row at 35% opacity, editor highlights removed
- **Focused** (solo'd): ring highlight on row, full editor highlight
- **Dimmed** (another group solo'd): 35% opacity + grayscale, editor highlights at low opacity

### Section Headings

The song panel has two collapsible sections:

| Section | Contains | Default State |
|---------|----------|---------------|
| **RHYMES** | Rhyme scheme + rhyme groups | Expanded |
| **LINES** | Per-line syllable breakdown | Collapsed |

Collapse state is persisted to localStorage (`clean_writer_song_rhymes_collapsed`, `clean_writer_song_lines_collapsed`). Style matches BREAKDOWN and QUICK STATS headers (uppercase, tracking-wider, chevron indicator).

### Per-Line Syllable Breakdown

Scrollable list showing each line's text preview and syllable count:
- **Density coloring:** lines with >70% of the maximum syllable count use the accent color
- **Opacity scaling:** 0.35 (lowest) to 0.9 (highest) based on relative count
- Bottom fade gradient appears when more than 12 lines

### Syllable Annotation Toggle

Click the **eye icon** next to the "Song" header to overlay syllable counts on words in the editor. Annotations appear below each word, colored by rhyme group. The preference persists across sessions.

### Rhyme Detection

Two detection methods, used in priority order:

1. **CMU Pronouncing Dictionary** — phoneme-based key from last stressed vowel onward (most accurate)
2. **Suffix heuristic** — vowel suffix matching (fallback, marked with ~)

### Syllable Counting

1. CMU dictionary lookup (phoneme vowel count)
2. 200+ common word overrides
3. Heuristic fallback: count vowel groups, subtract silent-e (minimum 1)

### Rhyme Color Palette

8 OKLCH-uniform colors (L=0.65, C=0.155):

| Index | Color | Hex |
|-------|-------|-----|
| 0 | Red | #de6457 |
| 1 | Blue | #2895e7 |
| 2 | Green | #859b00 |
| 3 | Orange | #d86d28 |
| 4 | Purple | #917be5 |
| 5 | Teal | #00ac9e |
| 6 | Pink | #d3629c |
| 7 | Yellow | #b78800 |

Colors are customizable via the Theme Customizer.

---

## Build Identity & Deployment

Build metadata is surfaced in two focused places:
- Gear area version badge (`gear-build-version`) shows `vX.Y.Z` only
- Settings footer (`settings-build-footer`) shows full identity + wordism

Format:
- Gear badge: `vX.Y.Z`
- Settings footer: `Build vX.Y.Z · track · Build wordism: ...`
- `X.Y.Z` comes from `package.json` by default, or `VITE_APP_VERSION`
- `track` comes from `VITE_BUILD_TRACK` (fallback: Vite mode)

This keeps local and Vercel deployments comparable without commit hashes.

Recommended Vercel envs:
```bash
VITE_APP_VERSION=1.7.0
VITE_BUILD_TRACK=production
```

---

## Golden Ratio Spacing

The app uses golden ratio (φ = 1.618) based spacing for harmonious proportions across all device sizes.

### Fibonacci-like Scale

| Name | Pixels | Calculation |
|------|--------|-------------|
| xs | 8px | Base unit |
| sm | 13px | 8 × 1.618 ≈ 13 |
| md | 21px | 13 × 1.618 ≈ 21 |
| lg | 34px | 21 × 1.618 ≈ 34 |
| xl | 55px | 34 × 1.618 ≈ 55 |
| xxl | 89px | 55 × 1.618 ≈ 89 |

### Device-Specific Spacing

| Device | Horizontal Padding | Top Margin |
|--------|-------------------|------------|
| Mobile (<768px) | 13px | 55px |
| Tablet (768-1023px) | 21px | 55px |
| Desktop (≥1024px) | 34px | 89px |

### Usage in Tailwind

```tsx
// Typewriter padding
className="px-[13px] py-[21px] md:px-[21px] md:py-[34px] lg:px-[34px] lg:py-[55px]"

// Top bar padding
className="p-[13px] md:p-[21px]"

// Main content top margin
className="pt-[55px] md:pt-[55px] lg:pt-[89px]"
```

### Constants File

```typescript
// constants/spacing.ts
export const GOLDEN_SCALE = {
  xs: 8,    // Base
  sm: 13,   // 8 × 1.618
  md: 21,   // 13 × 1.618
  lg: 34,   // 21 × 1.618
  xl: 55,   // 34 × 1.618
  xxl: 89,  // 55 × 1.618
} as const;
```

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

| Cmd+Shift+Alt+O | Toggle overlap debug overlay |

*Note: Number shortcuts only work when not typing in the editor.*

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
| `clean_writer_song_rhymes_collapsed` | Song RHYMES section collapsed state |
| `clean_writer_song_lines_collapsed` | Song LINES section collapsed state |

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
