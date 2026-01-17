import { RisoTheme } from './types';

export const THEME_STORAGE_KEY = 'clean_writer_theme';
export const FONT_STORAGE_KEY = 'clean_writer_font';

export const FONT_OPTIONS = [
  { id: 'courier-prime', name: 'Courier Prime', family: '"Courier Prime", monospace' },
  { id: 'space-mono', name: 'Space Mono', family: '"Space Mono", monospace' },
  { id: 'jetbrains', name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { id: 'inter', name: 'Inter', family: '"Inter", sans-serif' },
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, "Helvetica Neue", Arial, sans-serif' },
  { id: 'system', name: 'System', family: 'system-ui, -apple-system, sans-serif' },
] as const;

export type FontId = typeof FONT_OPTIONS[number]['id'];

export const THEMES: RisoTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    text: '#333333',
    background: '#FDFBF7',
    highlight: {
      noun: '#0078BF',
      pronoun: '#9B59B6',
      verb: '#F15060',
      adjective: '#00A95C',
      adverb: '#E67E22',
      preposition: '#1ABC9C',
      conjunction: '#FF6C2F',
      article: '#5F6C6D', // Fixed: was #7F8C8D (2.5:1), now darker for 3.5:1+
      interjection: '#E91E63',
    },
    accent: '#F15060',
    cursor: '#F15060',
    strikethrough: '#F15060',
    selection: 'rgba(241,80,96,0.2)'
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    text: '#FDFBF7',
    background: '#0078BF',
    highlight: {
      noun: '#FFE800',
      pronoun: '#E91E63',
      verb: '#FFFFFF',
      adjective: '#F15060',
      adverb: '#00A95C',
      preposition: '#9B59B6',
      conjunction: '#00A95C',
      article: '#D5E0E6', // Fixed: was #95A5A6, now lighter for better contrast
      interjection: '#FF6C2F',
    },
    accent: '#FFE800',
    cursor: '#FFE800',
    strikethrough: '#FFFFFF',
    selection: 'rgba(255,232,0,0.3)'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    text: '#e8e8e8',
    background: '#1a1a2e',
    highlight: {
      noun: '#00d9ff',
      pronoun: '#bd93f9',
      verb: '#ff79c6',
      adjective: '#50fa7b',
      adverb: '#ffb86c',
      preposition: '#8be9fd',
      conjunction: '#ffb86c',
      article: '#8A93B4', // Fixed: was #6272a4, now lighter for 3:1+
      interjection: '#ff5555',
    },
    accent: '#00d9ff',
    cursor: '#00d9ff',
    strikethrough: '#ff79c6',
    selection: 'rgba(0,217,255,0.2)'
  },
  {
    id: 'sepia',
    name: 'Sepia',
    text: '#5c4b37',
    background: '#f4ecd8',
    highlight: {
      noun: '#8b6914',
      pronoun: '#8e44ad',
      verb: '#a65d3f',
      adjective: '#6b8e23',
      adverb: '#d35400',
      preposition: '#16a085',
      conjunction: '#996633',
      article: '#6B7580', // Fixed: was #95a5a6, now darker for better contrast
      interjection: '#c0392b',
    },
    accent: '#8b6914',
    cursor: '#8b6914',
    strikethrough: '#a65d3f',
    selection: 'rgba(139,105,20,0.2)'
  },
  {
    id: 'ink',
    name: 'Ink',
    text: '#f5f5f5',
    background: '#0d0d0d',
    highlight: {
      noun: '#ff6b6b',
      pronoun: '#a29bfe',
      verb: '#4ecdc4',
      adjective: '#ffe66d',
      adverb: '#fd79a8',
      preposition: '#74b9ff',
      conjunction: '#95e1d3',
      article: '#8A9499', // Fixed: was #636e72 (2.3:1), now lighter for 4:1+
      interjection: '#e17055',
    },
    accent: '#ff6b6b',
    cursor: '#ff6b6b',
    strikethrough: '#4ecdc4',
    selection: 'rgba(255,107,107,0.2)'
  },
  // NEW THEMES
  {
    id: 'paper',
    name: 'Paper',
    text: '#1A1A1A',
    background: '#FFFFFF',
    highlight: {
      noun: '#2563EB',
      pronoun: '#7C3AED',
      verb: '#DC2626',
      adjective: '#059669',
      adverb: '#D97706',
      preposition: '#0891B2',
      conjunction: '#EA580C',
      article: '#6B7280',
      interjection: '#DB2777',
    },
    accent: '#2563EB',
    cursor: '#2563EB',
    strikethrough: '#DC2626',
    selection: 'rgba(37,99,235,0.2)'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    text: '#00FF00',
    background: '#0C0C0C',
    highlight: {
      noun: '#00FF00',
      pronoun: '#00FFFF',
      verb: '#FF6600',
      adjective: '#FFFF00',
      adverb: '#FF00FF',
      preposition: '#00CCFF',
      conjunction: '#66FF66',
      article: '#669966',
      interjection: '#FF3333',
    },
    accent: '#00FF00',
    cursor: '#00FF00',
    strikethrough: '#FF6600',
    selection: 'rgba(0,255,0,0.2)'
  },
  {
    id: 'warmth',
    name: 'Warmth',
    text: '#4A3728',
    background: '#FFF8F0',
    highlight: {
      noun: '#B45309',
      pronoun: '#9333EA',
      verb: '#DC2626',
      adjective: '#15803D',
      adverb: '#D97706',
      preposition: '#0D9488',
      conjunction: '#EA580C',
      article: '#78716C',
      interjection: '#BE185D',
    },
    accent: '#D97706',
    cursor: '#D97706',
    strikethrough: '#DC2626',
    selection: 'rgba(217,119,6,0.2)'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    text: '#E2E8F0',
    background: '#0F172A',
    highlight: {
      noun: '#38BDF8',
      pronoun: '#C084FC',
      verb: '#F472B6',
      adjective: '#4ADE80',
      adverb: '#FBBF24',
      preposition: '#22D3EE',
      conjunction: '#2DD4BF',
      article: '#94A3B8',
      interjection: '#FB7185',
    },
    accent: '#38BDF8',
    cursor: '#38BDF8',
    strikethrough: '#F472B6',
    selection: 'rgba(56,189,248,0.2)'
  },
  {
    id: 'forest',
    name: 'Forest',
    text: '#D4E5D4',
    background: '#1A2F1A',
    highlight: {
      noun: '#4ADE80',
      pronoun: '#C4B5FD',
      verb: '#FCA5A5',
      adjective: '#FDE047',
      adverb: '#FDBA74',
      preposition: '#67E8F9',
      conjunction: '#86EFAC',
      article: '#9CA38A',
      interjection: '#F9A8D4',
    },
    accent: '#4ADE80',
    cursor: '#4ADE80',
    strikethrough: '#FCA5A5',
    selection: 'rgba(74,222,128,0.2)'
  },
];

export const MOCK_ANALYSIS_DELAY = 1500; // ms
