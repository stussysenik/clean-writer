import nlp from 'compromise';
import { SyntaxAnalysis } from '../types';

export const analyzeSyntax = async (text: string): Promise<SyntaxAnalysis> => {
  if (!text.trim()) {
    return { nouns: [], verbs: [], adjectives: [], conjunctions: [] };
  }

  // Use compromise for local NLP analysis
  const doc = nlp(text);

  // Helper to get unique lowercase words from a tag match
  const getUniqueWords = (tag: string): string[] => {
    // compromise .out('array') returns an array of strings
    const words = doc.match(tag).out('array');
    return Array.from(new Set((words as string[]).map((w: string) => w.toLowerCase())));
  };

  // Extract parts of speech
  // compromise uses #HashTags for POS
  return {
    nouns: getUniqueWords('#Noun'),
    verbs: getUniqueWords('#Verb'),
    adjectives: getUniqueWords('#Adjective'),
    conjunctions: getUniqueWords('#Conjunction'),
  };
};