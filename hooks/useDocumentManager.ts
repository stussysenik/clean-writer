import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Project, Document, JournalEntry, DocType } from "../types";

const PROJECTS_KEY = "clean_writer_projects";
const DOCUMENTS_KEY = "clean_writer_documents";
const JOURNAL_KEY = "clean_writer_journal_entries";

function loadLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveLocal<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

interface UseDocumentManagerReturn {
  projects: Project[];
  documents: Document[];
  journalEntries: JournalEntry[];
  loading: boolean;
  createProject: (title: string) => Promise<Project | null>;
  createDocument: (projectId: string, title: string, docType: DocType) => Promise<Document | null>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  listDocuments: (projectId?: string) => Promise<void>;
  listProjects: () => Promise<void>;
  createJournalEntry: (date?: string) => Promise<JournalEntry | null>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  listJournalEntries: () => Promise<void>;
}

export function useDocumentManager(): UseDocumentManagerReturn {
  const [projects, setProjects] = useState<Project[]>(() => loadLocal(PROJECTS_KEY));
  const [documents, setDocuments] = useState<Document[]>(() => loadLocal(DOCUMENTS_KEY));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadLocal(JOURNAL_KEY));
  const [loading, setLoading] = useState(false);

  const listProjects = useCallback(async () => {
    if (!supabase) {
      setProjects(loadLocal(PROJECTS_KEY));
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.from("projects").select("*").order("position");
      if (data) {
        const mapped = data.map(snakeToCamelProject);
        setProjects(mapped);
        saveLocal(PROJECTS_KEY, mapped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (title: string): Promise<Project | null> => {
    const project: Project = {
      id: uuid(),
      userId: "",
      title,
      position: projects.length,
      createdAt: now(),
      updatedAt: now(),
    };

    if (!supabase) {
      setProjects(prev => {
        const updated = [...prev, project];
        saveLocal(PROJECTS_KEY, updated);
        return updated;
      });
      return project;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    project.userId = user.id;

    const { data } = await supabase.from("projects").insert({
      id: project.id,
      user_id: user.id,
      title,
      position: project.position,
    }).select().single();

    if (data) {
      const mapped = snakeToCamelProject(data);
      setProjects(prev => {
        const updated = [...prev, mapped];
        saveLocal(PROJECTS_KEY, updated);
        return updated;
      });
      return mapped;
    }
    return null;
  }, []);

  const createDocument = useCallback(async (projectId: string, title: string, docType: DocType): Promise<Document | null> => {
    const doc: Document = {
      id: uuid(),
      projectId,
      userId: "",
      title,
      content: "",
      docType,
      position: documents.filter(d => d.projectId === projectId).length,
      wordCount: 0,
      charCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };

    if (!supabase) {
      setDocuments(prev => { const u = [...prev, doc]; saveLocal(DOCUMENTS_KEY, u); return u; });
      return doc;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    doc.userId = user.id;

    const { data } = await supabase.from("documents").insert({
      id: doc.id,
      project_id: projectId,
      user_id: user.id,
      title,
      doc_type: docType,
      position: doc.position,
    }).select().single();

    if (data) {
      const mapped = snakeToCamelDoc(data);
      setDocuments(prev => { const u = [...prev, mapped]; saveLocal(DOCUMENTS_KEY, u); return u; });
      return mapped;
    }
    return null;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    setDocuments(prev => {
      const u = prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: now() } : d);
      saveLocal(DOCUMENTS_KEY, u);
      return u;
    });

    if (!supabase) return;
    const snakeUpdates: Record<string, unknown> = { updated_at: now() };
    if (updates.content !== undefined) snakeUpdates.content = updates.content;
    if (updates.title !== undefined) snakeUpdates.title = updates.title;
    if (updates.wordCount !== undefined) snakeUpdates.word_count = updates.wordCount;
    if (updates.charCount !== undefined) snakeUpdates.char_count = updates.charCount;
    if (updates.position !== undefined) snakeUpdates.position = updates.position;

    await supabase.from("documents").update(snakeUpdates).eq("id", id);
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    setDocuments(prev => { const u = prev.filter(d => d.id !== id); saveLocal(DOCUMENTS_KEY, u); return u; });

    if (!supabase) return;
    await supabase.from("documents").delete().eq("id", id);
  }, []);

  const listDocuments = useCallback(async (projectId?: string) => {
    if (!supabase) {
      setDocuments(loadLocal(DOCUMENTS_KEY));
      return;
    }
    setLoading(true);
    try {
      let query = supabase.from("documents").select("*").order("position");
      if (projectId) query = query.eq("project_id", projectId);
      const { data } = await query;
      if (data) {
        const mapped = data.map(snakeToCamelDoc);
        setDocuments(mapped);
        saveLocal(DOCUMENTS_KEY, mapped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createJournalEntry = useCallback(async (date?: string): Promise<JournalEntry | null> => {
    const entryDate = date || new Date().toISOString().split("T")[0];
    const entry: JournalEntry = {
      id: uuid(),
      userId: "",
      entryDate,
      content: "",
      wordCount: 0,
      charCount: 0,
      writingDurationSeconds: 0,
      createdAt: now(),
      updatedAt: now(),
    };

    if (!supabase) {
      setJournalEntries(prev => { const u = [...prev, entry]; saveLocal(JOURNAL_KEY, u); return u; });
      return entry;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    entry.userId = user.id;

    const { data } = await supabase.from("journal_entries").insert({
      id: entry.id,
      user_id: user.id,
      entry_date: entryDate,
    }).select().single();

    if (data) {
      const mapped = snakeToCamelJournal(data);
      setJournalEntries(prev => { const u = [...prev, mapped]; saveLocal(JOURNAL_KEY, u); return u; });
      return mapped;
    }
    return null;
  }, []);

  const updateJournalEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => {
      const u = prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: now() } : e);
      saveLocal(JOURNAL_KEY, u);
      return u;
    });

    if (!supabase) return;
    const snakeUpdates: Record<string, unknown> = { updated_at: now() };
    if (updates.content !== undefined) snakeUpdates.content = updates.content;
    if (updates.mood !== undefined) snakeUpdates.mood = updates.mood;
    if (updates.wordCount !== undefined) snakeUpdates.word_count = updates.wordCount;
    if (updates.charCount !== undefined) snakeUpdates.char_count = updates.charCount;
    if (updates.writingDurationSeconds !== undefined) snakeUpdates.writing_duration_seconds = updates.writingDurationSeconds;

    await supabase.from("journal_entries").update(snakeUpdates).eq("id", id);
  }, []);

  const listJournalEntries = useCallback(async () => {
    if (!supabase) {
      setJournalEntries(loadLocal(JOURNAL_KEY));
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.from("journal_entries").select("*").order("entry_date", { ascending: false });
      if (data) {
        const mapped = data.map(snakeToCamelJournal);
        setJournalEntries(mapped);
        saveLocal(JOURNAL_KEY, mapped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects, documents, journalEntries, loading,
    createProject, createDocument, updateDocument, deleteDocument,
    listDocuments, listProjects, createJournalEntry, updateJournalEntry, listJournalEntries,
  };
}

// Snake_case → camelCase mappers
function snakeToCamelProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    position: row.position as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function snakeToCamelDoc(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    projectId: row.project_id as string | undefined,
    userId: row.user_id as string,
    title: row.title as string,
    content: row.content as string,
    docType: row.doc_type as Document["docType"],
    position: row.position as number,
    wordCount: row.word_count as number,
    charCount: row.char_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function snakeToCamelJournal(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    entryDate: row.entry_date as string,
    content: row.content as string,
    mood: row.mood as string | undefined,
    wordCount: row.word_count as number,
    charCount: row.char_count as number,
    writingDurationSeconds: row.writing_duration_seconds as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
