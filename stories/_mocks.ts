import type {
  RisoTheme,
  HighlightConfig,
  SyntaxAnalysis,
  SyntaxSets,
  SongAnalysis,
} from "../types";
import { toSyntaxSets } from "../types";

// ── Themes ──────────────────────────────────────────────────

export const CLASSIC_THEME: RisoTheme = {
  id: "classic",
  name: "Classic",
  text: "#333333",
  background: "#FDFBF7",
  highlight: {
    noun: "#0078BF",
    pronoun: "#9B59B6",
    verb: "#F15060",
    adjective: "#00A95C",
    adverb: "#E67E22",
    preposition: "#1ABC9C",
    conjunction: "#FF6C2F",
    article: "#5F6C6D",
    interjection: "#E91E63",
    url: "#2980B9",
    number: "#8E6F3E",
    hashtag: "#2980B9",
  },
  accent: "#F15060",
  cursor: "#F15060",
  strikethrough: "#F15060",
  selection: "rgba(241,80,96,0.2)",
};

export const MIDNIGHT_THEME: RisoTheme = {
  id: "midnight",
  name: "Midnight",
  text: "#e8e8e8",
  background: "#1a1a2e",
  highlight: {
    noun: "#00d9ff",
    pronoun: "#bd93f9",
    verb: "#ff79c6",
    adjective: "#50fa7b",
    adverb: "#ffb86c",
    preposition: "#8be9fd",
    conjunction: "#ffb86c",
    article: "#8A93B4",
    interjection: "#ff5555",
    url: "#69C4FF",
    number: "#F1FA8C",
    hashtag: "#69C4FF",
  },
  accent: "#00d9ff",
  cursor: "#00d9ff",
  strikethrough: "#ff79c6",
  selection: "rgba(0,217,255,0.2)",
};

export const PAPER_THEME: RisoTheme = {
  id: "paper",
  name: "Paper",
  text: "#1A1A1A",
  background: "#FFFFFF",
  highlight: {
    noun: "#2563EB",
    pronoun: "#7C3AED",
    verb: "#DC2626",
    adjective: "#059669",
    adverb: "#D97706",
    preposition: "#0891B2",
    conjunction: "#EA580C",
    article: "#6B7280",
    interjection: "#DB2777",
    url: "#1D4ED8",
    number: "#92400E",
    hashtag: "#1D4ED8",
  },
  accent: "#2563EB",
  cursor: "#2563EB",
  strikethrough: "#DC2626",
  selection: "rgba(37,99,235,0.15)",
};

// ── Highlight Config ────────────────────────────────────────

export const ALL_HIGHLIGHTS_ON: HighlightConfig = {
  nouns: true,
  pronouns: true,
  verbs: true,
  adjectives: true,
  adverbs: true,
  prepositions: true,
  conjunctions: true,
  articles: true,
  interjections: true,
  urls: true,
  numbers: true,
  hashtags: true,
};

export const ALL_HIGHLIGHTS_OFF: HighlightConfig = {
  nouns: false,
  pronouns: false,
  verbs: false,
  adjectives: false,
  adverbs: false,
  prepositions: false,
  conjunctions: false,
  articles: false,
  interjections: false,
  urls: false,
  numbers: false,
  hashtags: false,
};

// ── Sample Content ──────────────────────────────────────────

export const SAMPLE_CONTENT = `\u201CIt is the time you have wasted for your rose that makes your rose so important.\u201D

\u201CPeople have forgotten this truth,\u201D the fox said. \u201CBut you must not forget it. You become responsible forever for what you have tamed. You are responsible for your rose.\u201D

\u2014 Antoine de Saint-Exup\u00e9ry, The Little Prince`;

export const SHORT_CONTENT = "hello world! #artisanattitude";

// ── Syntax Data ─────────────────────────────────────────────

export const SAMPLE_SYNTAX_ANALYSIS: SyntaxAnalysis = {
  nouns: [
    "time", "rose", "rose", "people", "truth", "fox", "rose",
    "prince", "time", "rose", "rose",
  ],
  pronouns: ["it", "you", "your", "you", "it", "you", "you", "your", "you", "your"],
  verbs: [
    "is", "wasted", "makes", "forgotten", "said", "forget",
    "become", "tamed", "are", "is", "wasted", "makes",
  ],
  adjectives: ["important", "responsible", "responsible", "important"],
  adverbs: ["forever", "so"],
  prepositions: ["for", "for", "for", "for"],
  conjunctions: ["but"],
  articles: ["the", "the", "the", "the"],
  interjections: [],
  urls: [],
  numbers: [],
  hashtags: [],
};

export const SAMPLE_SYNTAX_SETS: SyntaxSets = toSyntaxSets(SAMPLE_SYNTAX_ANALYSIS);

export const SHORT_SYNTAX_ANALYSIS: SyntaxAnalysis = {
  nouns: ["world"],
  pronouns: [],
  verbs: [],
  adjectives: [],
  adverbs: [],
  prepositions: [],
  conjunctions: [],
  articles: [],
  interjections: ["hello"],
  urls: [],
  numbers: [],
  hashtags: ["#artisanattitude"],
};

export const SHORT_SYNTAX_SETS: SyntaxSets = toSyntaxSets(SHORT_SYNTAX_ANALYSIS);

// ── Song Data ───────────────────────────────────────────────

export const SAMPLE_SONG_DATA: SongAnalysis = {
  lines: [
    {
      text: "It is the time you have wasted",
      words: [
        { text: "It", syllables: 1, rhymeKey: "" },
        { text: "is", syllables: 1, rhymeKey: "" },
        { text: "the", syllables: 1, rhymeKey: "" },
        { text: "time", syllables: 1, rhymeKey: "ime" },
        { text: "you", syllables: 1, rhymeKey: "oo" },
        { text: "have", syllables: 1, rhymeKey: "" },
        { text: "wasted", syllables: 2, rhymeKey: "asted" },
      ],
      totalSyllables: 8,
    },
  ],
  rhymeGroups: [
    { key: "ose", words: ["rose", "rose"], colorIndex: 0 },
    { key: "ooth", words: ["truth"], colorIndex: 1 },
  ],
  totalSyllables: 42,
  flowMetrics: {
    rhymeDensity: 15,
    avgSyllablesPerLine: 10.5,
    internalRhymeCount: 1,
    multiSyllabicRhymes: 0,
    longestRhymeChain: 2,
  },
  rhymeScheme: { pattern: "Free", label: "Free Verse" },
};

export const RHYME_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
] as const;
