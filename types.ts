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

export interface SyntaxSets {
  nouns: Set<string>;
  pronouns: Set<string>;
  verbs: Set<string>;
  adjectives: Set<string>;
  adverbs: Set<string>;
  prepositions: Set<string>;
  conjunctions: Set<string>;
  articles: Set<string>;
  interjections: Set<string>;
}

export function toSyntaxSets(analysis: SyntaxAnalysis): SyntaxSets {
  return {
    nouns: new Set(analysis.nouns),
    pronouns: new Set(analysis.pronouns),
    verbs: new Set(analysis.verbs),
    adjectives: new Set(analysis.adjectives),
    adverbs: new Set(analysis.adverbs),
    prepositions: new Set(analysis.prepositions),
    conjunctions: new Set(analysis.conjunctions),
    articles: new Set(analysis.articles),
    interjections: new Set(analysis.interjections),
  };
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
