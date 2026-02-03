import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../../types';
import { countWords } from '../../services/localSyntaxService';
import { useResponsiveBreakpoint } from '../../hooks/useResponsiveBreakpoint';
import { useHarmonicaDrag, HarmonicaStage } from '../../hooks/useHarmonicaDrag';
import CornerFoldTab from './CornerFoldTab';
import HarmonicaContainer from './HarmonicaContainer';
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

  // Harmonica drag system for mobile
  const {
    state: harmonicaState,
    handlers: harmonicaHandlers,
    close: harmonicaClose,
  } = useHarmonicaDrag({
    reducedMotion,
    onStageChange: (stage: HarmonicaStage) => {
      // Sync isOpen state with harmonica stage
      setIsOpen(stage !== 'closed');
    },
  });

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

  // Toggle panel (mobile only - kept for backwards compatibility with onClick prop)
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close on outside click (mobile only)
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        harmonicaState.stage !== 'closed' &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        harmonicaClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [harmonicaState.stage, harmonicaClose, isMobile]);

  // Mark panel as seen when opened (mobile) or when mounted (desktop)
  useEffect(() => {
    if ((harmonicaState.stage !== 'closed' || isDesktop) && !hasSeenPanel && onPanelSeen) {
      onPanelSeen();
    }
  }, [harmonicaState.stage, isDesktop, hasSeenPanel, onPanelSeen]);

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

  // Mobile: Harmonica panel with 3-stage drag gesture
  return (
    <div
      ref={containerRef}
      className="fixed right-0 z-[55] flex items-end"
      style={{
        bottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))',
        paddingRight: 'env(safe-area-inset-right)',
        maxHeight: 'calc(100dvh - 100px)',
      }}
    >
      <HarmonicaContainer
        theme={theme}
        stage={harmonicaState.stage}
        isDragging={harmonicaState.isDragging}
        dragProgress={harmonicaState.dragProgress}
        reducedMotion={reducedMotion}
      >
        {{
          tab: (
            <CornerFoldTab
              theme={theme}
              wordCount={wordCount}
              isOpen={harmonicaState.stage !== 'closed'}
              hasSeenPanel={hasSeenPanel}
              onClick={toggle}
              harmonicaMode={true}
              stage={harmonicaState.stage}
              dragProgress={harmonicaState.dragProgress}
              onDragStart={harmonicaHandlers.onDragStart}
              onDragMove={harmonicaHandlers.onDragMove}
              onDragEnd={harmonicaHandlers.onDragEnd}
            />
          ),
          peek: (
            <div className="flex items-center justify-center h-full px-3">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: theme.text }}
              >
                {wordCount}
              </span>
              <span
                className="text-xs uppercase tracking-wider opacity-50 ml-2"
                style={{ color: theme.text }}
              >
                words
              </span>
            </div>
          ),
          expand: (
            <div className="px-3 py-2">
              <div
                className="text-[10px] uppercase tracking-widest opacity-40 flex items-center gap-2"
                style={{ color: theme.text }}
              >
                <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
                <span>Breakdown</span>
                <span className="flex-1 h-px" style={{ backgroundColor: `${theme.text}20` }} />
              </div>
            </div>
          ),
          full: (
            <PanelBody
              theme={theme}
              wordCount={wordCount}
              syntaxData={syntaxData}
              highlightConfig={highlightConfig}
              onToggleHighlight={onToggleHighlight}
              soloMode={soloMode}
              onSoloToggle={onSoloToggle}
              isOpen={harmonicaState.stage === 'full'}
              onCategoryHover={onCategoryHover}
            />
          ),
        }}
      </HarmonicaContainer>
    </div>
  );
};

export default UnifiedSyntaxPanel;
