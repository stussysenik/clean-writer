import React from 'react';
import { RisoTheme, HighlightConfig } from '../../types';
import { IconNoun, IconVerb, IconAdj, IconConj } from './Icons';
import TouchButton from '../TouchButton';

interface SyntaxTogglesProps {
  theme: RisoTheme;
  highlightConfig: HighlightConfig;
  onToggle: (key: keyof HighlightConfig) => void;
  visible: boolean;
}

const SyntaxToggles: React.FC<SyntaxTogglesProps> = ({
  theme,
  highlightConfig,
  onToggle,
  visible,
}) => {
  return (
    <div
      className="flex gap-1 mb-2 p-1.5 bg-black/5 rounded-lg backdrop-blur-sm w-fit transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <TouchButton
        onClick={() => onToggle('nouns')}
        className={`p-1.5 rounded hover:bg-white/50 transition-all ${
          highlightConfig.nouns ? 'opacity-100' : 'opacity-40 grayscale'
        }`}
        title="Nouns"
      >
        <span style={{ color: theme.highlight.noun }}>
          <IconNoun />
        </span>
      </TouchButton>

      <TouchButton
        onClick={() => onToggle('verbs')}
        className={`p-1.5 rounded hover:bg-white/50 transition-all ${
          highlightConfig.verbs ? 'opacity-100' : 'opacity-40 grayscale'
        }`}
        title="Verbs"
      >
        <span style={{ color: theme.highlight.verb }}>
          <IconVerb />
        </span>
      </TouchButton>

      <TouchButton
        onClick={() => onToggle('adjectives')}
        className={`p-1.5 rounded hover:bg-white/50 transition-all ${
          highlightConfig.adjectives ? 'opacity-100' : 'opacity-40 grayscale'
        }`}
        title="Adjectives"
      >
        <span style={{ color: theme.highlight.adjective }}>
          <IconAdj />
        </span>
      </TouchButton>

      <TouchButton
        onClick={() => onToggle('conjunctions')}
        className={`p-1.5 rounded hover:bg-white/50 transition-all ${
          highlightConfig.conjunctions ? 'opacity-100' : 'opacity-40 grayscale'
        }`}
        title="Conjunctions"
      >
        <span style={{ color: theme.highlight.conjunction }}>
          <IconConj />
        </span>
      </TouchButton>
    </div>
  );
};

export default SyntaxToggles;
