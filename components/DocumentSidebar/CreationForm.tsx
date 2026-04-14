import React, { useEffect, useRef, useState } from "react";
import type { Project, DocType } from "../../types";

export type CreationMode = "project" | "document";

interface CreationFormProps {
  mode: CreationMode;
  isOpen: boolean;
  projects: Project[];
  textColor: string;
  accentColor: string;
  onCancel: () => void;
  onSubmitProject: (title: string) => Promise<Project | null> | Project | null;
  onSubmitDocument: (
    projectId: string | undefined,
    title: string,
    docType: DocType,
  ) => Promise<unknown> | unknown;
}

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "standalone", label: "Standalone" },
  { value: "chapter", label: "Chapter" },
  { value: "scratchpad", label: "Scratchpad" },
];

const UNFILED_VALUE = "__unfiled__";

const CreationForm: React.FC<CreationFormProps> = ({
  mode,
  isOpen,
  projects,
  textColor,
  accentColor,
  onCancel,
  onSubmitProject,
  onSubmitDocument,
}) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocType>("standalone");
  const [projectId, setProjectId] = useState<string>(() =>
    projects[0]?.id ?? UNFILED_VALUE,
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Default the project picker to the first project whenever the form opens
      // so reopening doesn't surface a stale id from a since-deleted project.
      setProjectId(projects[0]?.id ?? UNFILED_VALUE);
      // Autofocus the title input on the next frame so the focus lands after layout.
      requestAnimationFrame(() => titleRef.current?.focus());
    } else {
      setTitle("");
      setError(null);
      setIsPending(false);
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setError("Title is required");
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      let result: unknown;
      if (mode === "project") {
        result = await onSubmitProject(trimmed);
      } else {
        const targetProjectId = projectId === UNFILED_VALUE ? undefined : projectId;
        result = await onSubmitDocument(targetProjectId, trimmed, docType);
      }
      if (result == null) {
        setError("Could not save. Try again.");
        setIsPending(false);
        return;
      }
      // Success: parent will collapse the form via onCancel/onSubmit-done flow.
      setTitle("");
      setIsPending(false);
      onCancel();
    } catch {
      setError("Something went wrong. Try again.");
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const fieldStyle: React.CSSProperties = {
    backgroundColor: `${textColor}0D`,
    color: textColor,
    border: `1px solid ${textColor}1A`,
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="px-3 pb-3 space-y-2"
      data-testid={`creation-form-${mode}`}
      aria-label={mode === "project" ? "Create new project" : "Create new document"}
    >
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={mode === "project" ? "Project title" : "Document title"}
        className="w-full px-3 py-2 text-sm rounded-md outline-none focus:ring-1 transition"
        style={{
          ...fieldStyle,
          // @ts-expect-error custom CSS variable for focus ring
          "--tw-ring-color": accentColor,
        }}
        aria-label="Title"
        disabled={isPending}
      />

      {mode === "document" && (
        <div className="grid grid-cols-2 gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="px-2 py-2 text-xs rounded-md outline-none cursor-pointer"
            style={fieldStyle}
            aria-label="Document type"
            disabled={isPending}
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value} style={{ color: "#000" }}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-2 py-2 text-xs rounded-md outline-none cursor-pointer truncate"
            style={fieldStyle}
            aria-label="Parent project"
            disabled={isPending}
          >
            <option value={UNFILED_VALUE} style={{ color: "#000" }}>
              Unfiled
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} style={{ color: "#000" }}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-[11px]"
          style={{ color: "#ef4444" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-xs font-semibold rounded-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: accentColor,
            color: "#fff",
            boxShadow: `0 1px 0 ${textColor}20, inset 0 -1px 0 rgba(0,0,0,0.08)`,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isPending ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-3 py-2 text-xs rounded-none transition-colors"
          style={{
            backgroundColor: "transparent",
            color: textColor,
            opacity: 0.6,
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreationForm;
