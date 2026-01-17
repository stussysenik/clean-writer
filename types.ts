export type SyntaxType =
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
  nouns: string[];
  pronouns: string[];
  verbs: string[];
  adjectives: string[];
  adverbs: string[];
  prepositions: string[];
  conjunctions: string[];
  articles: string[];
  interjections: string[];
}

export interface HighlightConfig {
  nouns: boolean;
  pronouns: boolean;
  verbs: boolean;
  adjectives: boolean;
  adverbs: boolean;
  prepositions: boolean;
  conjunctions: boolean;
  articles: boolean;
  interjections: boolean;
}

export interface RisoTheme {
  id: string;
  name: string;
  text: string;
  background: string;
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
  accent: string;
  cursor: string;        // Blinking cursor color
  strikethrough: string; // Strikethrough text decoration
  selection: string;     // Text selection background (rgba)
}

export interface CustomTheme extends RisoTheme {
  isCustom: boolean;
  wordVisibility: HighlightConfig;
}

export type ViewMode = 'write' | 'preview';
