import { GoogleGenAI, Type } from "@google/genai";
import { SyntaxAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Cache to prevent redundant calls for same text
const analysisCache = new Map<string, SyntaxAnalysis>();

export const analyzeSyntax = async (text: string): Promise<SyntaxAnalysis> => {
  if (!text.trim()) {
    return { nouns: [], verbs: [], adjectives: [], conjunctions: [] };
  }

  // Basic cache check
  if (analysisCache.has(text)) {
    return analysisCache.get(text)!;
  }

  const textToAnalyze = text.length > 2000 ? text.slice(-2000) : text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify the nouns, verbs, adjectives, and conjunctions in the following text. 
      Return the result as a JSON object with four arrays containing the words found.
      Convert words to lowercase for matching.
      Text: "${textToAnalyze}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nouns: { type: Type.ARRAY, items: { type: Type.STRING } },
            verbs: { type: Type.ARRAY, items: { type: Type.STRING } },
            adjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            conjunctions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const cleanResult: SyntaxAnalysis = {
      nouns: result.nouns || [],
      verbs: result.verbs || [],
      adjectives: result.adjectives || [],
      conjunctions: result.conjunctions || []
    };

    analysisCache.set(text, cleanResult);
    return cleanResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return { nouns: [], verbs: [], adjectives: [], conjunctions: [] };
  }
};
