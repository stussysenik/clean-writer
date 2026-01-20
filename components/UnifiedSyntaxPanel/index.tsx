import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../../types';
import { countWords } from '../../services/localSyntaxService';
import CornerFoldTab from './CornerFoldTab';
import FoldContainer from './FoldContainer';
import PanelBody from './PanelBody';

interface UnifiedSyntaxPanelProps {
  content: string;
  theme: RisoTheme;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode?: keyof HighlightConfig | null;
  onSoloToggle?: (key: keyof HighlightConfig | null) => void;
  hasSeenPanel?: boolean;
  onPanelSeen?: () => void;
}

const UnifiedSyntaxPanel: React.FC<UnifiedSyntaxPanelProps> = ({
  content,
  theme,
  syntaxData,
  highlightConfig,
  onToggleHighlight,
  soloMode = null,
  onSoloToggle = () => {},
  hasSeenPanel = true,
  onPanelSeen,
}) => {
  const wordCount = countWords(content);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check for reduced motion preference
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Toggle panel
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close panel
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle tab click
  const handleTabClick = useCallback(() => {
    toggle();
  }, [toggle]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Mark panel as seen when opened
  useEffect(() => {
    if (isOpen && !hasSeenPanel && onPanelSeen) {
      onPanelSeen();
    }
  }, [isOpen, hasSeenPanel, onPanelSeen]);

  // Don't render if no content
  if (wordCount === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-row-reverse items-center"
    >
      {/* Corner tab attached to panel - slides together */}
      {/* Using flex-row-reverse so tab stays on RIGHT edge */}
      <CornerFoldTab
        theme={theme}
        wordCount={wordCount}
        isOpen={isOpen}
        hasSeenPanel={hasSeenPanel}
        onClick={handleTabClick}
      />

      {/* Panel container with slide animation */}
      <FoldContainer
        theme={theme}
        isOpen={isOpen}
        reducedMotion={reducedMotion}
      >
        <PanelBody
          theme={theme}
          wordCount={wordCount}
          syntaxData={syntaxData}
          highlightConfig={highlightConfig}
          onToggleHighlight={onToggleHighlight}
          soloMode={soloMode}
          onSoloToggle={onSoloToggle}
        />
      </FoldContainer>
    </div>
  );
};

export default UnifiedSyntaxPanel;
