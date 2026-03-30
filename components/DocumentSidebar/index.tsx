import React, { useEffect, useRef, useCallback } from "react";
import { Project, Document, JournalEntry, WritingSession } from "../../types";
import { useResponsiveBreakpoint } from "../../hooks/useResponsiveBreakpoint";
import ProjectTree from "./ProjectTree";
import JournalSection from "./JournalSection";
import WritingLog from "./WritingLog";

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  documents: Document[];
  journalEntries: JournalEntry[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateProject: (title: string) => void;
  onCreateDocument: (projectId: string, title: string) => void;
  onCreateJournalEntry: () => void;
  onDeleteDocument: (id: string) => void;
  textColor: string;
  bgColor: string;
  accentColor: string;
  sessions?: WritingSession[];
}

const SIDEBAR_WIDTH = 280;

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
  sessions = [],
}) => {
  const { isMobile } = useResponsiveBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on outside click (mobile overlay)
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCreateProject = useCallback(() => {
    const title = `Project ${projects.length + 1}`;
    onCreateProject(title);
  }, [projects.length, onCreateProject]);

  const handleCreateDocument = useCallback(() => {
    // Create in the first project if one exists, otherwise unfiled
    const projectId = projects.length > 0 ? projects[0].id : "";
    const title = "Untitled";
    onCreateDocument(projectId, title);
  }, [projects, onCreateDocument]);

  // --- Quick Actions Bar ---
  const quickActions = (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      {[
        { label: "New Project", onClick: handleCreateProject },
        { label: "New Doc", onClick: handleCreateDocument },
        { label: "New Entry", onClick: onCreateJournalEntry },
      ].map(({ label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-150 hover:brightness-110"
          style={{
            backgroundColor: `${accentColor}1A`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // --- Close Button ---
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

  // --- Sidebar Content ---
  const sidebarContent = (
    <>
      {closeButton}
      {quickActions}

      {/* Divider */}
      <div
        className="mx-3 h-px"
        style={{ backgroundColor: `${textColor}10` }}
      />

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0 }}
      >
        <ProjectTree
          projects={projects}
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelectDocument={onSelectDocument}
          onCreateDocument={onCreateDocument}
          onDeleteDocument={onDeleteDocument}
          textColor={textColor}
          accentColor={accentColor}
        />

        {/* Divider */}
        <div
          className="mx-3 h-px"
          style={{ backgroundColor: `${textColor}10` }}
        />

        <JournalSection
          entries={journalEntries}
          onSelectEntry={onSelectDocument}
          onCreateEntry={onCreateJournalEntry}
          activeDocumentId={activeDocumentId}
          textColor={textColor}
          accentColor={accentColor}
        />

        {/* Divider */}
        <div
          className="mx-3 h-px"
          style={{ backgroundColor: `${textColor}10` }}
        />

        <WritingLog
          sessions={sessions}
          journalEntries={journalEntries}
          textColor={textColor}
          accentColor={accentColor}
        />
      </div>
    </>
  );

  // --- Mobile: Full-height overlay drawer from left ---
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[70] transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full z-[71] flex flex-col transition-transform duration-300 ease-out"
          style={{
            width: SIDEBAR_WIDTH,
            maxWidth: "85vw",
            transform: isOpen ? "translateX(0)" : `translateX(-100%)`,
            backgroundColor: `${bgColor}F2`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRight: `1px solid ${textColor}15`,
            boxShadow: isOpen
              ? `4px 0 24px rgba(0,0,0,0.2), 1px 0 4px rgba(0,0,0,0.1)`
              : "none",
          }}
        >
          {/* Paper grain texture — matching the existing syntax panel pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }}
          />

          {sidebarContent}
        </div>
      </>
    );
  }

  // --- Desktop: Fixed left sidebar with slide-in/out ---
  return (
    <div
      ref={sidebarRef}
      className="fixed top-0 left-0 h-full z-[50] flex flex-col transition-transform duration-300 ease-out"
      style={{
        width: SIDEBAR_WIDTH,
        transform: isOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
        backgroundColor: `${bgColor}E6`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRight: `1px solid ${textColor}15`,
        boxShadow: isOpen
          ? `4px 0 32px rgba(0,0,0,0.12), 1px 0 8px rgba(0,0,0,0.06), inset 0 0 0 1px ${textColor}08`
          : "none",
      }}
    >
      {/* Paper grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glass highlight at right edge */}
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
