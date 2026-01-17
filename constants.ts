import { RisoTheme } from './types';

export const THEME_STORAGE_KEY = 'clean_writer_theme';

export const THEMES: RisoTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    text: '#333333',
    background: '#FDFBF7',
    highlight: {
      noun: '#0078BF',
      verb: '#F15060',
      adjective: '#00A95C',
      conjunction: '#FF6C2F',
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
      verb: '#FFFFFF',
      adjective: '#F15060',
      conjunction: '#00A95C',
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
      verb: '#ff79c6',
      adjective: '#50fa7b',
      conjunction: '#ffb86c',
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
      verb: '#a65d3f',
      adjective: '#6b8e23',
      conjunction: '#996633',
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
      verb: '#4ecdc4',
      adjective: '#ffe66d',
      conjunction: '#95e1d3',
    },
    accent: '#ff6b6b',
    cursor: '#ff6b6b',
    strikethrough: '#4ecdc4',
    selection: 'rgba(255,107,107,0.2)'
  }
];

export const MOCK_ANALYSIS_DELAY = 1500; // ms
