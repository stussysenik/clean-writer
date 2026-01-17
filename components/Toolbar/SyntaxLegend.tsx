import React, { useState } from 'react';
import { RisoTheme } from '../../types';
import TouchButton from '../TouchButton';
import {
  IconNoun,
  IconPronoun,
  IconVerb,
  IconAdj,
  IconAdverb,
  IconPreposition,
  IconConj,
  IconArticle,
  IconInterjection,
  IconInfo,
} from './Icons';

interface SyntaxLegendProps {
  theme: RisoTheme;
}

const LEGEND_ITEMS = [
  // Content Words (1-4)
  { number: 1, key: 'noun', icon: IconNoun, label: 'Nouns', example: 'cat, idea' },
  { number: 2, key: 'verb', icon: IconVerb, label: 'Verbs', example: 'run, think' },
  { number: 3, key: 'adjective', icon: IconAdj, label: 'Adjectives', example: 'big, happy' },
  { number: 4, key: 'adverb', icon: IconAdverb, label: 'Adverbs', example: 'quickly, very' },
  // Function Words (5-9)
  { number: 5, key: 'pronoun', icon: IconPronoun, label: 'Pronouns', example: 'he, they' },
  { number: 6, key: 'preposition', icon: IconPreposition, label: 'Prepositions', example: 'in, on' },
  { number: 7, key: 'conjunction', icon: IconConj, label: 'Conjunctions', example: 'and, but' },
  { number: 8, key: 'article', icon: IconArticle, label: 'Articles', example: 'the, a' },
  { number: 9, key: 'interjection', icon: IconInterjection, label: 'Interjections', example: 'wow, oh' },
] as const;

const SyntaxLegend: React.FC<SyntaxLegendProps> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchButton
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded hover:bg-white/50 transition-all opacity-60 hover:opacity-100"
        title="Word Types Legend"
      >
        <IconInfo />
      </TouchButton>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-md max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b border-current/10"
            >
              <h2 className="text-lg font-bold">Word Types</h2>
              <TouchButton
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </TouchButton>
            </div>

            {/* Content */}
            <div className="p-4 space-y-1 flex-1 overflow-y-auto">
              {/* Content Words Group */}
              <div className="pb-2">
                <p className="text-xs font-bold uppercase tracking-wide opacity-50 mb-2">
                  Content Words
                </p>
                {LEGEND_ITEMS.slice(0, 4).map(({ number, key, icon: Icon, label, example }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <span
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded"
                      style={{
                        backgroundColor: `${theme.highlight[key as keyof typeof theme.highlight]}20`,
                        color: theme.highlight[key as keyof typeof theme.highlight],
                      }}
                    >
                      {number}
                    </span>
                    <span style={{ color: theme.highlight[key as keyof typeof theme.highlight] }}>
                      <Icon />
                    </span>
                    <span className="font-medium flex-1">{label}</span>
                    <span className="text-sm opacity-50 italic">{example}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-current/10 my-2" />

              {/* Function Words Group */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wide opacity-50 mb-2">
                  Function Words
                </p>
                {LEGEND_ITEMS.slice(4).map(({ number, key, icon: Icon, label, example }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <span
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded"
                      style={{
                        backgroundColor: `${theme.highlight[key as keyof typeof theme.highlight]}20`,
                        color: theme.highlight[key as keyof typeof theme.highlight],
                      }}
                    >
                      {number}
                    </span>
                    <span style={{ color: theme.highlight[key as keyof typeof theme.highlight] }}>
                      <Icon />
                    </span>
                    <span className="font-medium flex-1">{label}</span>
                    <span className="text-sm opacity-50 italic">{example}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-current/10 text-center">
              <p className="text-xs opacity-50">Press 1-9 to toggle word types</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SyntaxLegend;
