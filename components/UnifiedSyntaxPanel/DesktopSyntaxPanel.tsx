import React, { useRef } from "react";
import {
  RisoTheme,
  SyntaxAnalysis,
  SyntaxSets,
  HighlightConfig,
  SongAnalysis,
  ColorEditTarget,
} from "../../types";
import { useDevLayout } from "../DevControls/context";
import PanelBody from "./PanelBody";
import CornerFoldTab from "./CornerFoldTab";

interface DesktopSyntaxPanelProps {
  theme: RisoTheme;
  wordCount: number;
  content: string;
  syntaxSets: SyntaxSets;
  syntaxData: SyntaxAnalysis;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode: keyof HighlightConfig | null;
  onSoloToggle: (key: keyof HighlightConfig | null) => void;
  onCategoryHover?: (category: keyof HighlightConfig | null) => void;
  songMode?: boolean;
  onToggleSongMode?: () => void;
  songData?: SongAnalysis | null;
  rhymeColors?: readonly string[];
  showSyllableAnnotations?: boolean;
  onToggleSyllableAnnotations?: () => void;
  focusedRhymeKey?: string | null;
  onFocusRhymeKey?: (key: string | null) => void;
  hoveredRhymeKey?: string | null;
  onHoverRhymeKey?: (key: string | null) => void;
  disabledRhymeKeys?: Set<string>;
  onToggleRhymeKey?: (key: string) => void;
  onEditColor?: (target: ColorEditTarget) => void;
  onQuickEditColor?: (target: ColorEditTarget, anchorEl: HTMLElement) => void;
  codeMode?: boolean;
  codeLanguage?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isOverlayMode?: boolean;
}

const DesktopSyntaxPanel: React.FC<DesktopSyntaxPanelProps> = ({
  theme,
  wordCount,
  content,
  syntaxSets,
  syntaxData,
  highlightConfig,
  onToggleHighlight,
  soloMode,
  onSoloToggle,
  onCategoryHover,
  songMode,
  onToggleSongMode,
  songData,
  rhymeColors,
  showSyllableAnnotations,
  onToggleSyllableAnnotations,
  focusedRhymeKey,
  onFocusRhymeKey,
  hoveredRhymeKey,
  onHoverRhymeKey,
  disabledRhymeKeys,
  onToggleRhymeKey,
  onEditColor,
  onQuickEditColor,
  codeMode = false,
  onToggleCodeMode,
  codeLanguage = "javascript",
  isOpen = true,
  onToggle,
  isOverlayMode = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dev = useDevLayout();
  const panelWidth = isOverlayMode ? "calc(100vw - 16px)" : `min(${dev.desktopPanelWidthMin}px, ${dev.desktopPanelWidthVw}vw)`;
  const panelMaxWidth = isOverlayMode ? "480px" : undefined;

  return (
    <div
      ref={panelRef}
      data-testid="desktop-syntax-panel"
      className="fixed z-50 flex items-end transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        right: isOverlayMode ? "0px" : (dev.desktopPanelRight ?? undefined),
        bottom: "max(48px, calc(44px + env(safe-area-inset-bottom)))",
      }}
    >
      {/* Tab hanging off the left side */}
      <div className="relative">
        <CornerFoldTab
          theme={theme}
          wordCount={wordCount}
          isOpen={isOpen}
          hasSeenPanel={true}
          onClick={onToggle || (() => {})}
        />
      </div>

      <div
        className="rounded-l-2xl overflow-hidden no-scrollbar relative"
        style={{
          // Solid theme background — design context: no glassmorphism.
          backgroundColor: theme.background,
          border: `1px solid ${theme.text}14`,
          borderRight: "none",
          boxShadow: `0 1px 2px ${theme.text}0a, 0 8px 24px ${theme.text}0c`,
          width: panelWidth,
          maxWidth: panelMaxWidth,
          minWidth: "320px",
          height: isOverlayMode ? "min(85dvh, calc(100dvh - 80px))" : undefined,
          maxHeight: "calc(100vh - 48px - 80px)",
          overflowX: "hidden",
          overflowY: "auto",
          padding: `${dev.desktopPanelPaddingY}px ${dev.desktopPanelPaddingX}px`,
        }}
      >
        {/* Paper grain texture */}
        <div
          data-overlap-ignore
          className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Glass highlight at top edge */}
        <div
          data-overlap-ignore
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
          content={content}
          syntaxSets={syntaxSets}
          syntaxData={syntaxData}
          highlightConfig={highlightConfig}
          onToggleHighlight={onToggleHighlight}
          soloMode={soloMode}
          onSoloToggle={onSoloToggle}
          isOpen={isOpen}
          onCategoryHover={onCategoryHover}
          songMode={songMode}
          onToggleSongMode={onToggleSongMode}
          songData={songData}
          rhymeColors={rhymeColors}
          showSyllableAnnotations={showSyllableAnnotations}
          onToggleSyllableAnnotations={onToggleSyllableAnnotations}
          focusedRhymeKey={focusedRhymeKey}
          onFocusRhymeKey={onFocusRhymeKey}
          hoveredRhymeKey={hoveredRhymeKey}
          onHoverRhymeKey={onHoverRhymeKey}
          disabledRhymeKeys={disabledRhymeKeys}
          onToggleRhymeKey={onToggleRhymeKey}
          onEditColor={onEditColor}
          onQuickEditColor={onQuickEditColor}
          codeMode={codeMode}
          onToggleCodeMode={onToggleCodeMode}
          codeLanguage={codeLanguage}
        />
      </div>
    </div>
  );
};

export default DesktopSyntaxPanel;
