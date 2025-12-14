export type SyntaxType = 'noun' | 'verb' | 'adjective' | 'conjunction';

export interface SyntaxAnalysis {
  nouns: string[];
  verbs: string[];
  adjectives: string[];
  conjunctions: string[];
}

export interface HighlightConfig {
  nouns: boolean;
  verbs: boolean;
  adjectives: boolean;
  conjunctions: boolean;
}

export interface RisoTheme {
  id: string;
  name: string;
  text: string;
  background: string;
  highlight: {
    noun: string;
    verb: string;
    adjective: string;
    conjunction: string;
  };
  accent: string;
}

export type ViewMode = 'write' | 'preview';
