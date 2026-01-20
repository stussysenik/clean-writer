import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../../types';
import { countWords } from '../../services/localSyntaxService';
import { useResponsiveBreakpoint } from '../../hooks/useResponsiveBreakpoint';
import CornerFoldTab from './CornerFoldTab';
import FoldContainer from './FoldContainer';
import PanelBody from './PanelBody';
import DesktopSyntaxPanel from './DesktopSyntaxPanel';

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
  onCategoryHover?: (category: keyof HighlightConfig | null) => void;
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
  onCategoryHover,
}) => {
  const wordCount = countWords(content);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { isDesktop, isMobile } = useResponsiveBreakpoint();
  const prevScreenRef = useRef<'mobile' | 'desktop' | null>(null);
  const transitionRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Paradigm transition animation when switching between mobile/desktop
  useEffect(() => {
    const currentScreen = isDesktop ? 'desktop' : 'mobile';

    if (prevScreenRef.current !== null && prevScreenRef.current !== currentScreen && !reducedMotion) {
      // Animate the transition between paradigms
      if (transitionRef.current) {
        gsap.fromTo(
          transitionRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
          }
        );
      }
    }

    prevScreenRef.current = currentScreen;
  }, [isDesktop, reducedMotion]);

  // Toggle panel (mobile only)
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close panel (mobile only)
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle tab click
  const handleTabClick = useCallback(() => {
    toggle();
  }, [toggle]);

  // Close on outside click (mobile only)
  useEffect(() => {
    if (!isMobile) return;

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
  }, [isOpen, close, isMobile]);

  // Mark panel as seen when opened (mobile) or when mounted (desktop)
  useEffect(() => {
    if ((isOpen || isDesktop) && !hasSeenPanel && onPanelSeen) {
      onPanelSeen();
    }
  }, [isOpen, isDesktop, hasSeenPanel, onPanelSeen]);

  // Don't render if no content
  if (wordCount === 0) return null;

  // Desktop: Always visible, left-positioned panel
  if (isDesktop) {
    return (
      <div ref={transitionRef}>
        <DesktopSyntaxPanel
          theme={theme}
          wordCount={wordCount}
          syntaxData={syntaxData}
          highlightConfig={highlightConfig}
          onToggleHighlight={onToggleHighlight}
          soloMode={soloMode}
          onSoloToggle={onSoloToggle}
          onCategoryHover={onCategoryHover}
        />
      </div>
    );
  }

  // Mobile: Right fold-tab panel
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
          isOpen={isOpen}
          onCategoryHover={onCategoryHover}
        />
      </FoldContainer>
    </div>
  );
};

export default UnifiedSyntaxPanel;
