import React, { useState } from "react";
import { Project, Document } from "../../types";

interface ProjectTreeProps {
  projects: Project[];
  documents: Document[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: (projectId: string, title: string) => void;
  onDeleteDocument: (id: string) => void;
  textColor: string;
  accentColor: string;
}

/**
 * Formats a date string into a human-readable relative time.
 * Keeps the sidebar feeling alive — "2h ago" instead of "2026-03-30T14:22:00Z".
 */
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "yesterday";
  return new Date(dateStr).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

const ProjectTree: React.FC<ProjectTreeProps> = ({
  projects,
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  textColor,
  accentColor,
}) => {
  // Track which projects are expanded (all expanded by default)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(projects.map((p) => p.id)),
  );
  // Track hovered document for showing delete button
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  const toggleProject = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateDocument = (projectId: string) => {
    const title = `Untitled ${documents.filter((d) => d.projectId === projectId).length + 1}`;
    onCreateDocument(projectId, title);
  };

  /** Documents belonging to a specific project, sorted by position */
  const docsForProject = (projectId: string) =>
    documents
      .filter((d) => d.projectId === projectId)
      .sort((a, b) => a.position - b.position);

  /** Documents without a project ("Unfiled") */
  const unfiledDocs = documents
    .filter((d) => !d.projectId)
    .sort((a, b) => a.position - b.position);

  const renderDocument = (doc: Document) => {
    const isActive = doc.id === activeDocumentId;
    const isHovered = doc.id === hoveredDocId;

    return (
      <button
        key={doc.id}
        onClick={() => onSelectDocument(doc.id)}
        onMouseEnter={() => setHoveredDocId(doc.id)}
        onMouseLeave={() => setHoveredDocId(null)}
        className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 group transition-colors duration-150"
        style={{
          backgroundColor: isActive ? `${accentColor}26` : "transparent",
          color: textColor,
        }}
      >
        {/* Document icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.4, flexShrink: 0 }}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>

        <span
          className="flex-1 text-sm truncate"
          style={{ opacity: isActive ? 1 : 0.8 }}
        >
          {doc.title}
        </span>

        {/* Word count badge */}
        <span
          className="text-[10px] tabular-nums flex-shrink-0"
          style={{ color: textColor, opacity: 0.35 }}
        >
          {doc.wordCount.toLocaleString()}w
        </span>

        {/* Relative time */}
        <span
          className="text-[10px] flex-shrink-0 hidden sm:inline"
          style={{ color: textColor, opacity: 0.3 }}
        >
          {formatRelativeTime(doc.updatedAt)}
        </span>

        {/* Delete button — visible on hover */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDocument(doc.id);
            }}
            className="p-0.5 rounded hover:bg-red-500/20 transition-colors flex-shrink-0"
            style={{ color: textColor, opacity: 0.4 }}
            aria-label={`Delete ${doc.title}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </button>
    );
  };

  const renderProjectSection = (project: Project) => {
    const isExpanded = expandedIds.has(project.id);
    const projectDocs = docsForProject(project.id);

    return (
      <div key={project.id} className="mb-1">
        {/* Project header */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button
            onClick={() => toggleProject(project.id)}
            className="flex items-center gap-1.5 flex-1 min-w-0 rounded-md px-1 py-0.5 hover:bg-white/5 transition-colors"
            style={{ color: textColor }}
          >
            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 150ms ease",
                opacity: 0.5,
                flexShrink: 0,
              }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider truncate" style={{ opacity: 0.6 }}>
              {project.title}
            </span>
            <span
              className="text-[10px] tabular-nums flex-shrink-0"
              style={{ color: textColor, opacity: 0.3 }}
            >
              {projectDocs.length}
            </span>
          </button>
          {/* Add document button */}
          <button
            onClick={() => handleCreateDocument(project.id)}
            className="p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
            style={{ color: accentColor, opacity: 0.7 }}
            aria-label={`New document in ${project.title}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Documents list */}
        {isExpanded && (
          <div className="pl-3">
            {projectDocs.length === 0 ? (
              <p
                className="text-xs px-3 py-2 italic"
                style={{ color: textColor, opacity: 0.3 }}
              >
                No documents yet
              </p>
            ) : (
              projectDocs.map(renderDocument)
            )}
          </div>
        )}
      </div>
    );
  };

  // Empty state
  if (projects.length === 0 && unfiledDocs.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm" style={{ color: textColor, opacity: 0.4 }}>
          No projects yet
        </p>
        <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.25 }}>
          Create a project to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="px-3 pt-3 pb-1">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: textColor, opacity: 0.4 }}
        >
          Projects
        </h3>
      </div>

      {/* Project sections */}
      {projects
        .sort((a, b) => a.position - b.position)
        .map(renderProjectSection)}

      {/* Unfiled documents */}
      {unfiledDocs.length > 0 && (
        <div className="mt-2">
          <div className="px-3 py-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: textColor, opacity: 0.3 }}
            >
              Unfiled
            </span>
          </div>
          <div className="pl-3">{unfiledDocs.map(renderDocument)}</div>
        </div>
      )}
    </div>
  );
};

export default ProjectTree;
