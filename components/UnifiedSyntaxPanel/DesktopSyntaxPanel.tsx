import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { RisoTheme, SyntaxAnalysis, HighlightConfig } from '../../types';
import PanelBody from './PanelBody';

interface DesktopSyntaxPanelProps {
  theme: RisoTheme;
  wordCount: number;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode: keyof HighlightConfig | null;
  onSoloToggle: (key: keyof HighlightConfig | null) => void;
  onCategoryHover?: (category: keyof HighlightConfig | null) => void;
}

const DesktopSyntaxPanel: React.FC<DesktopSyntaxPanelProps> = ({
  theme,
  wordCount,
  syntaxData,
  highlightConfig,
  onToggleHighlight,
  soloMode,
  onSoloToggle,
  onCategoryHover,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Check for reduced motion preference
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Entrance animation using GSAP
  useEffect(() => {
    if (panelRef.current && !hasAnimated.current && !reducedMotion) {
      hasAnimated.current = true;

      // Start from slightly off-screen (right side) and faded
      gsap.set(panelRef.current, {
        x: 20,
        opacity: 0,
      });

      // Animate in with spring-like effect
      gsap.to(panelRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, [reducedMotion]);

  return (
    <div
      ref={panelRef}
      data-testid="desktop-syntax-panel"
      className="fixed right-8 bottom-8 z-50 rounded-2xl overflow-hidden"
      style={{
        // Glassmorphism: semi-transparent background with blur
        backgroundColor: `${theme.background}E6`, // ~90% opacity
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        // Glass border effect
        border: `1px solid ${theme.text}15`,
        // Enhanced shadow with glass effect
        boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08), inset 0 0 0 1px ${theme.text}08`,
        // Initially hidden for animation (GSAP will animate in)
        opacity: reducedMotion ? 1 : undefined,
      }}
    >
      {/* Paper grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply rounded-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glass highlight at top edge */}
      <div
        className="absolute left-0 right-0 top-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right,
            transparent 0%,
            ${theme.text}20 20%,
            ${theme.text}20 80%,
            transparent 100%)`,
        }}
      />

      {/* Content */}
      <PanelBody
        theme={theme}
        wordCount={wordCount}
        syntaxData={syntaxData}
        highlightConfig={highlightConfig}
        onToggleHighlight={onToggleHighlight}
        soloMode={soloMode}
        onSoloToggle={onSoloToggle}
        isOpen={true}
        onCategoryHover={onCategoryHover}
      />
    </div>
  );
};

export default DesktopSyntaxPanel;
