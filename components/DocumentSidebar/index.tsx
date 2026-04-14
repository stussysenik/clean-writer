import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Project,
  Document,
  JournalEntry,
  WritingSession,
  DocType,
} from "../../types";
import { useResponsiveBreakpoint } from "../../hooks/useResponsiveBreakpoint";
import ProjectTree from "./ProjectTree";
import JournalSection from "./JournalSection";
import WritingLog from "./WritingLog";
import GuideSection from "./GuideSection";
import FeedbackSection from "./FeedbackSection";
import CreationForm, { CreationMode } from "./CreationForm";

export const DOCUMENT_SIDEBAR_WIDTH = 280;
type UtilitySection = "guide" | "feedback" | null;

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  documents: Document[];
  journalEntries: JournalEntry[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateProject: (title: string) => Promise<Project | null> | Project | null;
  onCreateDocument: (
    projectId: string | undefined,
    title: string,
    docType: DocType,
  ) => Promise<unknown> | unknown;
  onCreateJournalEntry: () => void;
  onDeleteDocument: (id: string) => void;
  textColor: string;
  bgColor: string;
  accentColor: string;
  themeId: string;
  wordCount: number;
  charCount: number;
  requestedUtilitySection?: UtilitySection;
  onUtilitySectionHandled?: () => void;
  sessions?: WritingSession[];
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  isOpen,
  onClose,
  projects,
  documents,
  journalEntries,
  activeDocumentId,
  onSelectDocument,
  onCreateProject,
  onCreateDocument,
  onCreateJournalEntry,
  onDeleteDocument,
  textColor,
  bgColor,
  accentColor,
  themeId,
  wordCount,
  charCount,
  requestedUtilitySection = null,
  onUtilitySectionHandled,
  sessions = [],
}) => {
  const { isMobile } = useResponsiveBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const guideSectionRef = useRef<HTMLDivElement>(null);
  const feedbackSectionRef = useRef<HTMLDivElement>(null);
  const [expandedUtility, setExpandedUtility] = useState<UtilitySection>(null);
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!requestedUtilitySection || !isOpen) return;

    setExpandedUtility(requestedUtilitySection);

    const targetRef =
      requestedUtilitySection === "guide"
        ? guideSectionRef
        : feedbackSectionRef;

    window.requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({
        behavior: isMobile ? "auto" : "smooth",
        block: "start",
      });
      onUtilitySectionHandled?.();
    });
  }, [isMobile, isOpen, onUtilitySectionHandled, requestedUtilitySection]);

  const toggleCreationForm = useCallback((mode: CreationMode) => {
    setCreationMode((prev) => (prev === mode ? null : mode));
  }, []);

  const closeCreationForm = useCallback(() => {
    setCreationMode(null);
  }, []);

  const toggleUtilitySection = useCallback(
    (section: Exclude<UtilitySection, null>) => {
      setExpandedUtility((prev) => (prev === section ? null : section));
    },
    [],
  );

  const quickActions = (
    <>
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3 pb-2">
        {[
          {
            label: "New Project",
            onClick: () => toggleCreationForm("project"),
            active: creationMode === "project",
            testid: "quick-new-project",
          },
          {
            label: "New Doc",
            onClick: () => toggleCreationForm("document"),
            active: creationMode === "document",
            testid: "quick-new-document",
          },
          {
            label: "New Entry",
            onClick: onCreateJournalEntry,
            active: false,
            testid: "quick-new-entry",
          },
          {
            label: "Guide",
            onClick: () => toggleUtilitySection("guide"),
            active: false,
            testid: "quick-guide",
          },
          {
            label: "Leave Note",
            onClick: () => toggleUtilitySection("feedback"),
            active: false,
            testid: "quick-leave-note",
          },
        ].map(({ label, onClick, active, testid }) => (
          <button
            key={label}
            onClick={onClick}
            data-testid={testid}
            aria-pressed={active}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-150 hover:brightness-110"
            style={{
              backgroundColor: active ? `${accentColor}33` : `${accentColor}1A`,
              color: accentColor,
              border: `1px solid ${active ? `${accentColor}60` : `${accentColor}30`}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <CreationForm
        mode={creationMode ?? "project"}
        isOpen={creationMode !== null}
        projects={projects}
        textColor={textColor}
        accentColor={accentColor}
        onCancel={closeCreationForm}
        onSubmitProject={onCreateProject}
        onSubmitDocument={onCreateDocument}
      />
    </>
  );

  const closeButton = (
    <button
      onClick={onClose}
      className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors z-10"
      style={{ color: textColor, opacity: 0.5 }}
      aria-label="Close sidebar"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );

  const renderDivider = (className = "mx-3 h-px") => (
    <div className={className} style={{ backgroundColor: `${textColor}10` }} />
  );

  const sidebarContent = (
    <>
      {closeButton}
      {quickActions}
      {renderDivider()}

      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        <div ref={guideSectionRef}>
          <GuideSection
            isExpanded={expandedUtility === "guide"}
            onToggle={() => toggleUtilitySection("guide")}
            textColor={textColor}
            accentColor={accentColor}
          />
        </div>

        {renderDivider("mx-3 mt-3 h-px")}

        <div ref={feedbackSectionRef}>
          <FeedbackSection
            isExpanded={expandedUtility === "feedback"}
            onToggle={() => toggleUtilitySection("feedback")}
            textColor={textColor}
            accentColor={accentColor}
            themeId={themeId}
            wordCount={wordCount}
            charCount={charCount}
            activeDocumentId={activeDocumentId}
          />
        </div>

        {renderDivider()}

        <ProjectTree
          projects={projects}
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelectDocument={onSelectDocument}
          onCreateDocument={(projectId, title) => onCreateDocument(projectId, title, "standalone")}
          onDeleteDocument={onDeleteDocument}
          textColor={textColor}
          accentColor={accentColor}
        />

        {renderDivider()}

        <JournalSection
          entries={journalEntries}
          onSelectEntry={onSelectDocument}
          onCreateEntry={onCreateJournalEntry}
          activeDocumentId={activeDocumentId}
          textColor={textColor}
          accentColor={accentColor}
        />

        {renderDivider()}

        <WritingLog
          sessions={sessions}
          journalEntries={journalEntries}
          textColor={textColor}
          accentColor={accentColor}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 z-[70] transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          aria-hidden="true"
        />

        <div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full z-[71] flex flex-col transition-transform duration-300 ease-out"
          data-testid="document-sidebar"
          role="complementary"
          style={{
            width: DOCUMENT_SIDEBAR_WIDTH,
            maxWidth: "85vw",
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            backgroundColor: `${bgColor}F2`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRight: `1px solid ${textColor}15`,
            boxShadow: isOpen
              ? "4px 0 24px rgba(0,0,0,0.2), 1px 0 4px rgba(0,0,0,0.1)"
              : "none",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'paperNoise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23paperNoise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
            }}
          />

          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="fixed top-0 left-0 h-full z-[50] flex flex-col transition-transform duration-300 ease-out"
      data-testid="document-sidebar"
      role="complementary"
      style={{
        width: DOCUMENT_SIDEBAR_WIDTH,
        transform: isOpen
          ? "translateX(0)"
          : `translateX(-${DOCUMENT_SIDEBAR_WIDTH}px)`,
        backgroundColor: `${bgColor}E6`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRight: `1px solid ${textColor}15`,
        boxShadow: isOpen
          ? `4px 0 32px rgba(0,0,0,0.12), 1px 0 8px rgba(0,0,0,0.06), inset 0 0 0 1px ${textColor}08`
          : "none",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'paperNoise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23paperNoise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
        }}
      />

      <div
        className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            transparent 0%,
            ${textColor}20 20%,
            ${textColor}20 80%,
            transparent 100%)`,
        }}
      />

      {sidebarContent}
    </div>
  );
};

export default DocumentSidebar;
