import nlp from 'compromise';
import { SyntaxAnalysis } from '../types';

/**
 * Centralized word counting function.
 * Uses whitespace splitting for consistent word counts across the app.
 */
export function countWords(content: string): number {
  if (!content.trim()) return 0;
  return content.trim().split(/\s+/).length;
}

/**
 * Get word type counts from syntax analysis.
 * Uses the array lengths from analyzed syntax data for accurate type counts.
 */
export function getWordTypeCounts(syntaxData: SyntaxAnalysis): Record<string, number> {
  return {
    nouns: syntaxData.nouns.length,
    verbs: syntaxData.verbs.length,
    adjectives: syntaxData.adjectives.length,
    adverbs: syntaxData.adverbs.length,
    pronouns: syntaxData.pronouns.length,
    prepositions: syntaxData.prepositions.length,
    conjunctions: syntaxData.conjunctions.length,
    articles: syntaxData.articles.length,
    interjections: syntaxData.interjections.length,
  };
}

// Static lists for high accuracy word detection
const ARTICLES = ['a', 'an', 'the'];

const PREPOSITIONS = [
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'up', 'about', 'into', 'over', 'after', 'under', 'between',
  'through', 'during', 'before', 'behind', 'above', 'below',
  'across', 'against', 'along', 'among', 'around', 'beside',
  'beyond', 'despite', 'down', 'except', 'inside', 'near',
  'off', 'onto', 'outside', 'past', 'since', 'toward',
  'towards', 'underneath', 'until', 'upon', 'within', 'without'
];

const INTERJECTIONS = [
  'wow', 'oh', 'ah', 'oops', 'ouch', 'yay', 'hey', 'hmm',
  'ugh', 'phew', 'alas', 'bravo', 'hurray', 'hooray', 'yikes',
  'ooh', 'aha', 'ahem', 'aww', 'bah', 'boo', 'duh', 'eek',
  'gee', 'geez', 'gosh', 'ha', 'haha', 'huh', 'hurrah',
  'jeez', 'meh', 'nah', 'nope', 'okay', 'ok', 'ow', 'psst',
  'shh', 'shush', 'tsk', 'uh', 'um', 'whoa', 'whoops', 'yep',
  'yes', 'yeah', 'yup', 'yo'
];

export const analyzeSyntax = async (text: string): Promise<SyntaxAnalysis> => {
  if (!text.trim()) {
    return {
      nouns: [],
      pronouns: [],
      verbs: [],
      adjectives: [],
      adverbs: [],
      prepositions: [],
      conjunctions: [],
      articles: [],
      interjections: [],
    };
  }

  // Use compromise for local NLP analysis
  const doc = nlp(text);

  // Helper to get unique lowercase words from a tag match
  const getUniqueWords = (tag: string): string[] => {
    const words = doc.match(tag).out('array');
    return Array.from(new Set((words as string[]).map((w: string) => w.toLowerCase())));
  };

  // Extract articles from text using static list (more reliable than NLP)
  const extractArticles = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    return Array.from(new Set(words.filter(w => ARTICLES.includes(w))));
  };

  // Extract prepositions - combine NLP with static list for better coverage
  const extractPrepositions = (text: string): string[] => {
    const nlpPrepositions = getUniqueWords('#Preposition');
    const words = text.toLowerCase().split(/\s+/);
    const staticPrepositions = words.filter(w => PREPOSITIONS.includes(w));
    return Array.from(new Set([...nlpPrepositions, ...staticPrepositions]));
  };

  // Extract interjections from text using static list
  const extractInterjections = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    return Array.from(new Set(
      INTERJECTIONS.filter(i => words.includes(i) || lowerText.includes(i + '!'))
    ));
  };

  return {
    nouns: getUniqueWords('#Noun'),
    pronouns: getUniqueWords('#Pronoun'),
    verbs: getUniqueWords('#Verb'),
    adjectives: getUniqueWords('#Adjective'),
    adverbs: getUniqueWords('#Adverb'),
    prepositions: extractPrepositions(text),
    conjunctions: getUniqueWords('#Conjunction'),
    articles: extractArticles(text),
    interjections: extractInterjections(text),
  };
};
