# Enhanced Syntax Highlighting & Custom Color System

**Status:** Proposal
**Priority:** High
**Created:** January 2025

---

## Executive Summary

Transform Clean Writer into a **programmatic visualization editor** with:
- Complete color customization (presets + custom picker)
- Expanded part-of-speech highlighting (9 word types)
- Improved NLP accuracy
- Better mobile spacing/visual hierarchy
- Paste functionality

---

## 1. Expanded Word Types

### Current (4 types)
| Type | Icon |
|------|------|
| Noun | ■ Square |
| Verb | ⚡ Bolt |
| Adjective | ● Circle |
| Conjunction | 🔗 Link |

### Proposed (9 types)
| Type | Description | Example | Default Color |
|------|-------------|---------|---------------|
| **Noun** | Person, place, thing | *cat, Maria, book* | #0078BF (blue) |
| **Pronoun** | Replaces noun | *he, she, they, it* | #9B59B6 (purple) |
| **Verb** | Action/state | *run, is, think* | #F15060 (red) |
| **Adjective** | Describes noun | *big, happy, red* | #00A95C (green) |
| **Adverb** | Modifies verb/adj | *quickly, very, well* | #E67E22 (orange) |
| **Preposition** | Shows relationship | *in, on, under, with* | #1ABC9C (teal) |
| **Conjunction** | Connects words | *and, but, or, because* | #FF6C2F (coral) |
| **Article** | Defines noun | *a, an, the* | #7F8C8D (gray) |
| **Interjection** | Exclamation | *wow, oh, alas* | #E91E63 (pink) |

### Implementation

```typescript
// types.ts
export type WordType =
  | 'noun'
  | 'pronoun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'article'
  | 'interjection';

export interface SyntaxAnalysis {
  noun: string[];
  pronoun: string[];
  verb: string[];
  adjective: string[];
  adverb: string[];
  preposition: string[];
  conjunction: string[];
  article: string[];
  interjection: string[];
}
```

---

## 2. Custom Color System

### Architecture

```
┌─────────────────────────────────────────────┐
│           Theme Presets (Quick Select)       │
│  [Classic] [Blueprint] [Midnight] [Custom]   │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         Color Customization Panel            │
│                                              │
│  Background:  [■ #FDFBF7] [🎨]              │
│  Text:        [■ #333333] [🎨]              │
│  Cursor:      [■ #F15060] [🎨]              │
│  Selection:   [■ rgba()] [🎨]               │
│  ─────────────────────────────              │
│  Word Types:                                 │
│  Noun:        [■ #0078BF] [🎨] [👁]         │
│  Pronoun:     [■ #9B59B6] [🎨] [👁]         │
│  Verb:        [■ #F15060] [🎨] [👁]         │
│  ...                                         │
└─────────────────────────────────────────────┘
```

### Data Structure

```typescript
// types.ts
export interface CustomTheme {
  id: string;
  name: string;
  isPreset: boolean;

  // Base colors
  background: string;
  text: string;
  cursor: string;
  selection: string;
  strikethrough: string;

  // Word type colors (all customizable)
  wordColors: {
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

  // Visibility toggles
  wordVisibility: {
    noun: boolean;
    pronoun: boolean;
    verb: boolean;
    adjective: boolean;
    adverb: boolean;
    preposition: boolean;
    conjunction: boolean;
    article: boolean;
    interjection: boolean;
  };
}
```

### UI Components

#### ColorPicker Component
```typescript
// components/ColorPicker.tsx
interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presets?: string[]; // Quick color swatches
  label?: string;
}
```

#### ThemeCustomizer Panel
```typescript
// components/ThemeCustomizer.tsx
// Slide-out panel or modal with:
// - Color pickers for each element
// - Visibility toggles per word type
// - Reset to preset button
// - Save custom theme button
```

---

## 3. Improved NLP Highlighting

### Current Issues
- Only 4 word types detected
- Some words misclassified
- Articles ("the", "a") not highlighted

### Solution: Enhanced Compromise.js Usage

```typescript
// services/localSyntaxService.ts
import nlp from 'compromise';

export function analyzeSyntax(text: string): SyntaxAnalysis {
  const doc = nlp(text);

  return {
    noun: doc.nouns().out('array'),
    pronoun: doc.pronouns().out('array'),
    verb: doc.verbs().out('array'),
    adjective: doc.adjectives().out('array'),
    adverb: doc.adverbs().out('array'),
    preposition: doc.prepositions().out('array'),
    conjunction: doc.conjunctions().out('array'),
    article: extractArticles(text), // "a", "an", "the"
    interjection: extractInterjections(doc),
  };
}

// Static lists for high accuracy
const ARTICLES = ['a', 'an', 'the'];
const PREPOSITIONS = [
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'up', 'about', 'into', 'over', 'after', 'under', 'between'
];
const CONJUNCTIONS = [
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'because', 'although', 'while', 'if', 'when', 'unless'
];
```

---

## 4. Enable Paste Functionality

### Current Behavior
- Backspace disabled (typewriter mode)
- No paste support

### Proposed Behavior
- **Paste allowed** via Cmd/Ctrl+V
- Pasted text appends to end
- Cursor moves to end of pasted text

```typescript
// Typewriter.tsx
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  setContent(content + pastedText);

  // Scroll to bottom
  setTimeout(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, 0);
};

// In textarea:
<textarea onPaste={handlePaste} ... />
```

---

## 5. Mobile Spacing & Visual Hierarchy

### Current Issues (from screenshots)
- Elements cramped together
- Word count and syntax toggles overlap visually
- No clear separation between UI zones

### Proposed Layout

```
┌────────────────────────────────────────┐
│  [Theme Circles]           top-right   │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │       Writing Area               │  │
│  │       (with cursor)              │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ━━━━━━━━━━━ spacer ━━━━━━━━━━━━━━━   │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  42 WORDS                        │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ■ ⚡ ● 🔗 ... (syntax toggles)   │  │
│  │ (scrollable row on mobile)       │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 👁 S ⬇ 🗑 ↔ ⚙                   │  │
│  │ (action buttons)                 │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### CSS Changes

```css
/* Mobile spacing improvements */
@media (max-width: 768px) {
  footer {
    gap: 16px; /* Increased from 8px */
    padding: 16px;
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }

  .syntax-toggles {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 12px;
    gap: 12px;
  }

  .action-buttons {
    justify-content: space-around;
    padding: 8px 0;
  }

  .word-count {
    margin-bottom: 8px;
  }
}
```

---

## 6. New File Structure

```
components/
├── ColorPicker/
│   ├── index.tsx          # Main picker component
│   ├── ColorSwatch.tsx    # Individual color swatch
│   └── HexInput.tsx       # Hex code input
├── ThemeCustomizer/
│   ├── index.tsx          # Panel container
│   ├── BaseColors.tsx     # Background, text, cursor
│   ├── WordTypeColors.tsx # All 9 word types
│   └── PresetSelector.tsx # Quick theme presets
├── Toolbar/
│   └── SyntaxToggles.tsx  # Updated for 9 types

hooks/
├── useCustomTheme.ts      # Theme state management
└── useLocalStorage.ts     # Persistence helper

services/
└── localSyntaxService.ts  # Enhanced NLP

types.ts                   # Updated interfaces
constants.ts               # Updated theme presets
```

---

## 7. Implementation Phases

### Phase 1: Expanded Word Types
1. Update `types.ts` with 9 word types
2. Enhance `localSyntaxService.ts` with better NLP
3. Update `SyntaxToggles.tsx` for 9 toggleable types
4. Update `Typewriter.tsx` highlighting logic

### Phase 2: Custom Color System
1. Create `ColorPicker` component
2. Create `ThemeCustomizer` panel
3. Update theme data structure
4. Add localStorage persistence for custom themes

### Phase 3: Paste & Mobile UX
1. Add paste handler to Typewriter
2. Improve mobile spacing CSS
3. Make syntax toggles horizontally scrollable
4. Add safe area insets for notched devices

### Phase 4: Polish
1. Add color picker animations
2. Add theme export/import (JSON)
3. Update documentation

---

## 8. Testing Checklist

- [ ] All 9 word types highlight correctly
- [ ] Custom colors persist after refresh
- [ ] Paste appends text and scrolls to end
- [ ] Mobile layout has proper spacing
- [ ] 44px tap targets maintained
- [ ] Color picker works on touch devices
- [ ] Theme presets still work as quick options
- [ ] PWA continues to work offline

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Word type coverage | 9 types (up from 4) |
| Highlighting accuracy | >90% for common words |
| Custom color options | Background, text, cursor, selection, 9 word types |
| Mobile spacing | 16px minimum between sections |
| Paste support | Full functionality |

---

## Appendix: Pantone-Ready Color Presets

For maximum color freedom, include curated palettes:

```typescript
const COLOR_PRESETS = {
  pantone2024: ['#FFBE98', '#A47864', '#BE3455', ...],
  monokai: ['#272822', '#F8F8F2', '#F92672', ...],
  solarized: ['#002B36', '#839496', '#B58900', ...],
  dracula: ['#282A36', '#F8F8F2', '#FF79C6', ...],
};
```

---

**Next Steps:** Approve this proposal to begin implementation.
