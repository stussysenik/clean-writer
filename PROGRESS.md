# Progress Log

Changelog and development progress for Clean Typewriter Experience t.

---

## Latest Release

### v1.3.0 - Right Panel Position & Mobile Harmonica UX

**Release Date:** February 2025

Repositioned syntax panel to right edge and added 3-stage "harmonica" drag gesture for mobile.

---

### v1.2.0 - Extended Themes, Mobile UX & PWA

**Release Date:** January 2025

Major update adding extended theme colors, mobile-first touch UX, and full PWA support.

---

## Changelog

### ✅ Phase 7: Right Panel Position & Mobile Harmonica UX

Repositioned the UnifiedSyntaxPanel from left to right edge and implemented a sophisticated 3-stage "harmonica" drag gesture for mobile.

**Desktop Changes:**
- Panel position moved from `left-8` to `right-8`
- Entrance animation direction reversed (slides in from right)

**Mobile Harmonica Gesture:**

| Stage | Drag Direction | Threshold | Content Revealed |
|-------|---------------|-----------|------------------|
| Closed | - | - | Tab with word count |
| Peek | Drag left 40px | 50% commit | Word count preview |
| Expand | Drag up 60px | 50% commit | Breakdown header |
| Full | Drag left 80px | 50% commit | Complete panel |

**Mechanical Feel:**
- Resistance effect before 50% threshold
- GSAP spring animation with overshoot (`back.out(1.2)`)
- Haptic feedback patterns at each snap point
- Directional arrow affordances guide users

**New Files:**
- `hooks/useHarmonicaDrag.ts` - State machine for 3-stage drag
- `components/UnifiedSyntaxPanel/HarmonicaContainer.tsx` - Staged accordion

**Files Modified:**
- `components/UnifiedSyntaxPanel/DesktopSyntaxPanel.tsx` - Right positioning
- `components/UnifiedSyntaxPanel/CornerFoldTab.tsx` - Drag handlers, affordances
- `components/UnifiedSyntaxPanel/index.tsx` - Harmonica integration
- `tests/e2e/responsive-syntax-panel.spec.ts` - Updated selectors, new tests

**E2E Tests Added:**
- Harmonica drag gesture progression
- Drag snap-back on incomplete gesture
- Tap-does-nothing verification (drag-only)
- Directional arrow affordance visibility
- Toolbar overlap prevention

---

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

### ✅ Phase 4: Comprehensive Playwright Test Suite

Test-first development framework with **151 tests** proving application consistency.

**Test Files (11 total):**

| File | Tests | Coverage |
|------|-------|----------|
| `core-mechanics.spec.ts` | 17 | Append-only typing, strikethrough, paste |
| `syntax-analysis.spec.ts` | 20 | NLP accuracy, word counts, categories |
| `responsive-paradigm.spec.ts` | 19 | Desktop/mobile mutual exclusivity |
| `state-persistence.spec.ts` | 22 | localStorage, themes, recovery |
| `motion-design.spec.ts` | 20 | Glassmorphism, GSAP, cursor effects |
| `mobile-paradigm.spec.ts` | 27 | Touch targets, keyboard, fold-tab |
| `desktop-paradigm.spec.ts` | 26 | Panel visibility, hover effects |
| `responsive.spec.ts` | varies | Breakpoint behavior |
| `theme-switching.spec.ts` | varies | Theme persistence |
| `responsive-syntax-panel.spec.ts` | varies | Panel responsive behavior |
| `mobile-touch.spec.ts` | varies | Touch interaction |

**Key Testing Patterns:**
- `pressSequentially` instead of `fill()` for append-only textarea
- `el.evaluate(el => el.click())` to bypass element interception
- `getByText('Nouns', { exact: true })` for strict mode compliance
- JavaScript click dispatch for mobile fold-tab interactions

**Data-testid Attributes Added:**
- `data-testid="desktop-syntax-panel"` - Desktop left panel
- `data-testid="mobile-fold-tab"` - Mobile right fold-tab
- `data-testid="ghost-cursor"` - Typewriter cursor
- `data-testid="strikethrough-btn"` - Strikethrough toolbar button

**Critical Assertions:**
- Desktop (≥1024px): Left panel visible, NO right fold-tab
- Mobile (<1024px): Right fold-tab visible, NO left panel
- Backspace/Delete have no effect (append-only mode)
- Glassmorphism has `backdrop-filter: blur(10px)`

**Test Commands:**
```bash
npm run test          # Headless (151 tests)
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

### ✅ Phase 6: Fix Origami Syntax Panel

Fixed the broken origami paper-fold animation and added UX improvements.

**Issues Fixed:**
| Issue | Root Cause | Solution |
|-------|------------|----------|
| Panel invisible | `rotateY(-90deg)` hides content behind screen | Replace with `translateX` slide-in |
| Tab/panel disconnected | Separate fixed positioning | Unified flexbox container |
| Hint always visible | Missing condition check | Hide when `hasSeenPanel` is true |
| No collapsible UI | Not implemented | Added toggle with max-height animation |

**New Features:**
- ✅ Smooth slide-in animation with spring easing
- ✅ Unified tab and panel that slide together
- ✅ Collapsible word type breakdown (persisted in localStorage)
- ✅ UTF-8 word counting (CJK characters, emoji)
- ✅ Proper reduced-motion support (opacity fallback)

**Files Modified:**
- `components/UnifiedSyntaxPanel/index.tsx` - Simplified to open/close state
- `components/UnifiedSyntaxPanel/FoldContainer.tsx` - translateX animation
- `components/UnifiedSyntaxPanel/CornerFoldTab.tsx` - Unified positioning
- `components/UnifiedSyntaxPanel/PanelBody.tsx` - Collapsible breakdown
- `components/Toolbar/index.tsx` - Fixed hint visibility
- `services/localSyntaxService.ts` - UTF-8 word counting

**Files Removed:**
- `components/UnifiedSyntaxPanel/useFoldAnimation.ts` - No longer needed
- `components/UnifiedSyntaxPanel/useFoldGestures.ts` - No longer needed

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
| 1.2.0 | Jan 2025 | Fixed syntax panel, UTF-8 word counting |
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
