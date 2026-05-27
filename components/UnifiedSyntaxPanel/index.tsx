import React, { useEffect } from "react";
import {
  RisoTheme,
  SyntaxAnalysis,
  SyntaxSets,
  HighlightConfig,
  SongAnalysis,
  ColorEditTarget,
} from "../../types";
import DesktopSyntaxPanel from "./DesktopSyntaxPanel";

interface UnifiedSyntaxPanelProps {
  content: string;
  theme: RisoTheme;
  syntaxData: SyntaxAnalysis;
  syntaxSets: SyntaxSets;
  highlightConfig: HighlightConfig;
  onToggleHighlight: (key: keyof HighlightConfig) => void;
  soloMode?: keyof HighlightConfig | null;
  onSoloToggle?: (key: keyof HighlightConfig | null) => void;
  hasSeenPanel?: boolean;
  onPanelSeen?: () => void;
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
  onToggleCodeMode?: () => void;
  codeLanguage?: string;
  isOverlayMode?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const UnifiedSyntaxPanel: React.FC<UnifiedSyntaxPanelProps> = ({
  content,
  theme,
  syntaxData,
  syntaxSets,
  highlightConfig,
  onToggleHighlight,
  soloMode = null,
  onSoloToggle = () => {},
  hasSeenPanel = true,
  onPanelSeen,
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
  codeMode,
  onToggleCodeMode,
  codeLanguage,
  isOverlayMode = false,
  isOpen = false,
  onToggle,
}) => {
  const wordCount = syntaxData.wordCount;

  // Mark panel as seen when opened
  useEffect(() => {
    if (isOpen && !hasSeenPanel && onPanelSeen) {
      onPanelSeen();
    }
  }, [isOpen, hasSeenPanel, onPanelSeen]);

  // Don't render if no content
  if (wordCount === 0) return null;

  return (
    <DesktopSyntaxPanel
      theme={theme}
      wordCount={wordCount}
      content={content}
      syntaxSets={syntaxSets}
      syntaxData={syntaxData}
      highlightConfig={highlightConfig}
      onToggleHighlight={onToggleHighlight}
      soloMode={soloMode}
      onSoloToggle={onSoloToggle}
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
      isOpen={isOpen}
      onToggle={onToggle}
      isOverlayMode={isOverlayMode}
    />
  );
};

export default UnifiedSyntaxPanel;
