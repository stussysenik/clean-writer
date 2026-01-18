# Progress Log

Changelog and development progress for Clean Typewriter Experience t.

---

## Latest Release

### v1.1.0 - Extended Themes, Mobile UX & PWA

**Release Date:** January 2025

Major update adding extended theme colors, mobile-first touch UX, and full PWA support.

---

## Changelog

### ✅ Phase 1: Extended Theme Colors

Extended the `RisoTheme` interface with three new properties:

| Property | Purpose |
|----------|---------|
| `cursor` | Blinking ghost cursor color |
| `strikethrough` | Strikethrough text decoration color |
| `selection` | Text selection background (rgba) |

**Theme Color Matrix:**

| Theme | Cursor | Strikethrough | Selection |
|-------|--------|---------------|-----------|
| Classic | #F15060 | #F15060 | rgba(241,80,96,0.2) |
| Blueprint | #FFE800 | #FFFFFF | rgba(255,232,0,0.3) |
| Midnight | #00d9ff | #ff79c6 | rgba(0,217,255,0.2) |
| Sepia | #8b6914 | #a65d3f | rgba(139,105,20,0.2) |
| Ink | #ff6b6b | #4ecdc4 | rgba(255,107,107,0.2) |

**Files Modified:**
- `types.ts` - Added interface properties
- `constants.ts` - Added colors to all themes
- `Typewriter.tsx` - Applied `theme.cursor`
- `MarkdownPreview.tsx` - Applied `theme.strikethrough`
- `App.tsx` - CSS variable sync for selection
- `index.css` - Selection styling

---

### ✅ Phase 2: Mobile-First UX

Created touch-friendly components with haptic feedback.

**New Files:**
- `hooks/useTouch.ts` - Touch event handler with haptics
- `components/TouchButton.tsx` - 44px tap target button

**Component Extraction:**
Extracted toolbar from `App.tsx` into modular components:
- `components/Toolbar/Icons/index.tsx`
- `components/Toolbar/SyntaxToggles.tsx`
- `components/Toolbar/ActionButtons.tsx`
- `components/Toolbar/ThemeSelector.tsx`
- `components/Toolbar/WordCount.tsx`
- `components/Toolbar/index.tsx`

**Improvements:**
- ✅ 44px minimum tap targets
- ✅ `touch-action: manipulation` for fast taps
- ✅ Passive scroll event listeners
- ✅ Responsive footer layout (`flex-col-reverse` on mobile)
- ✅ Larger theme selector circles on mobile

---

### ✅ Phase 3: PWA Support

Full Progressive Web App implementation for iOS/Android home screen.

**Dependencies Added:**
- `vite-plugin-pwa`
- `@vite-pwa/assets-generator`
- `sharp`

**Configuration:**
- `vite.config.ts` - PWA plugin with manifest and workbox
- `index.html` - iOS meta tags

**Meta Tags:**
```html
<meta name="theme-color" content="#FDFBF7" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="clean typewriter experience" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

**Icons Generated:**
- `public/apple-touch-icon.png` (180x180)
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/favicon.svg`

**Features:**
- ✅ Installable on iOS/Android
- ✅ Offline support via service worker
- ✅ Dynamic theme-color meta tag
- ✅ Google Fonts cached for offline

---

### ✅ Phase 4: Playwright Testing

Comprehensive E2E test suite across devices.

**Dependencies Added:**
- `@playwright/test`

**Test Files:**
- `tests/e2e/mobile-touch.spec.ts`
- `tests/e2e/theme-switching.spec.ts`
- `tests/e2e/pwa-install.spec.ts`
- `tests/e2e/responsive.spec.ts`

**Device Coverage:**
- Desktop Chrome
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

**Test Commands:**
```bash
npm run test          # Headless
npm run test:ui       # Interactive UI
npm run test:headed   # With browser
```

---

### ✅ Phase 5: Responsive Syntax Toolbar

Made the bottom toolbar responsive with mobile-first side panel.

**Changes:**
- Hidden SyntaxToggles on mobile (<768px)
- Added mobile hint indicator ("Syntax panel →")
- Added first-visit pulse animation on UnifiedSyntaxPanel tab
- LocalStorage tracking for `seen_syntax_panel`

**Files Modified:**
- `components/Toolbar/index.tsx` - Responsive visibility, mobile hint
- `components/UnifiedSyntaxPanel.tsx` - Pulse animation, onPanelSeen callback
- `App.tsx` - hasSeenSyntaxPanel state & persistence

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `types.ts` | Modified | Added cursor, strikethrough, selection |
| `constants.ts` | Modified | Added colors to all themes |
| `App.tsx` | Modified | Extracted components, added effects |
| `index.html` | Modified | PWA meta tags, viewport-fit |
| `index.css` | Created | Selection styling |
| `vite.config.ts` | Modified | PWA plugin config |
| `Typewriter.tsx` | Modified | theme.cursor, passive scroll |
| `MarkdownPreview.tsx` | Modified | theme.strikethrough |
| `hooks/useTouch.ts` | Created | Touch/haptic hook |
| `components/TouchButton.tsx` | Created | Mobile button |
| `components/Toolbar/*` | Created | 6 toolbar components |
| `scripts/generate-icons.js` | Created | Icon generator |
| `public/*` | Created | PWA icons |
| `playwright.config.ts` | Created | Test config |
| `tests/e2e/*` | Created | 4 test suites |
| `package.json` | Modified | Test scripts |

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.1.0 | Jan 2025 | Extended themes, mobile UX, PWA |
| 1.0.0 | Jan 2025 | Initial release |

---

## Roadmap

- [ ] Keyboard shortcuts (Cmd+S to export, etc.)
- [ ] Cloud sync option
- [ ] Multiple documents
- [ ] Custom themes
- [ ] Word goal tracking
- [ ] Writing statistics

---

**[← Back to README](./README.md)** | **[📖 Full Documentation](./DOCS.md)**
