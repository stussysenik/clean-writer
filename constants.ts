import { RisoTheme } from './types';

export const THEMES: RisoTheme[] = [
  {
    id: 'classic',
    name: 'Riso Classic',
    text: '#333333', // Soft Black
    background: '#FDFBF7', // Warm Paper
    highlight: {
      noun: '#0078BF', // Riso Blue
      verb: '#F15060', // Riso Pink
      adjective: '#00A95C', // Riso Teal
      conjunction: '#FF6C2F', // Riso Orange
    },
    accent: '#F15060'
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    text: '#FDFBF7', // Paper White
    background: '#0078BF', // Riso Blue
    highlight: {
      noun: '#FFE800', // Riso Yellow
      verb: '#FFFFFF', // White for actions
      adjective: '#F15060', // Riso Pink
      conjunction: '#00A95C', // Riso Teal
    },
    accent: '#FFE800'
  }
];

export const MOCK_ANALYSIS_DELAY = 1500; // ms
