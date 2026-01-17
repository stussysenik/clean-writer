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
  // FLEXOKI THEMES - Accessible IDE-quality color schemes
  {
    id: 'flexoki-light',
    name: 'Flexoki Light',
    text: '#100F0F',
    background: '#FFFCF0',
    highlight: {
      noun: '#205EA6',      // Blue 600
      pronoun: '#5E409D',   // Purple 600
      verb: '#AF3029',      // Red 600
      adjective: '#66800B', // Green 600
      adverb: '#BC5215',    // Orange 600
      preposition: '#24837B', // Cyan 600
      conjunction: '#AD8301', // Yellow 600
      article: '#6F6E69',   // Gray 600
      interjection: '#A02F6F', // Magenta 600
    },
    accent: '#205EA6',
    cursor: '#100F0F',
    strikethrough: '#AF3029',
    selection: 'rgba(32,94,166,0.2)'
  },
  {
    id: 'flexoki-dark',
    name: 'Flexoki Dark',
    text: '#FFFCF0',
    background: '#100F0F',
    highlight: {
      noun: '#4385BE',      // Blue 400
      pronoun: '#8B7EC8',   // Purple 400
      verb: '#D14D41',      // Red 400
      adjective: '#879A39', // Green 400
      adverb: '#DA702C',    // Orange 400
      preposition: '#3AA99F', // Cyan 400
      conjunction: '#D0A215', // Yellow 400
      article: '#878580',   // Gray 400
      interjection: '#CE5D97', // Magenta 400
    },
    accent: '#4385BE',
    cursor: '#FFFCF0',
    strikethrough: '#D14D41',
    selection: 'rgba(67,133,190,0.3)'
  },
];

export const MOCK_ANALYSIS_DELAY = 1500; // ms
