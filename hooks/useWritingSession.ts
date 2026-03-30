import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { SessionType, WritingSession } from "../types";

const SESSIONS_KEY = "clean_writer_writing_sessions";
const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes

interface UseWritingSessionReturn {
  isActive: boolean;
  sessionStart: number | null;
  wordsWritten: number;
  startSession: (sessionType: SessionType) => void;
  endSession: () => void;
  recordActivity: (currentWordCount: number) => void;
}

export function useWritingSession(): UseWritingSessionReturn {
  const [isActive, setIsActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [wordsWritten, setWordsWritten] = useState(0);

  const sessionTypeRef = useRef<SessionType>("freewrite");
  const initialWordCountRef = useRef(0);
  const lastWordCountRef = useRef(0);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const persistSession = useCallback(async (session: WritingSession) => {
    // Save to localStorage
    try {
      const sessions: WritingSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      sessions.push(session);
      // Keep last 100 sessions
      if (sessions.length > 100) sessions.splice(0, sessions.length - 100);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch { /* ignore */ }

    // Save to Supabase
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("writing_sessions").insert({
        id: session.id,
        user_id: user.id,
        started_at: session.startedAt,
        ended_at: session.endedAt,
        words_written: session.wordsWritten,
        chars_written: session.charsWritten,
        session_type: session.sessionType,
      });
    } catch { /* silently fail */ }
  }, []);

  const endSession = useCallback(() => {
    if (!isActive || !sessionStart || !sessionIdRef.current) return;

    const delta = lastWordCountRef.current - initialWordCountRef.current;
    const session: WritingSession = {
      id: sessionIdRef.current,
      userId: "",
      startedAt: new Date(sessionStart).toISOString(),
      endedAt: new Date().toISOString(),
      wordsWritten: Math.max(0, delta),
      charsWritten: 0,
      sessionType: sessionTypeRef.current,
    };

    persistSession(session);
    setIsActive(false);
    setSessionStart(null);
    setWordsWritten(0);
    sessionIdRef.current = null;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, [isActive, sessionStart, persistSession]);

  const startSession = useCallback((sessionType: SessionType) => {
    if (isActive) return;
    sessionTypeRef.current = sessionType;
    sessionIdRef.current = crypto.randomUUID();
    setIsActive(true);
    setSessionStart(Date.now());
    setWordsWritten(0);
  }, [isActive]);

  const recordActivity = useCallback((currentWordCount: number) => {
    if (!isActive) {
      initialWordCountRef.current = currentWordCount;
      lastWordCountRef.current = currentWordCount;
      return;
    }

    lastWordCountRef.current = currentWordCount;
    const delta = currentWordCount - initialWordCountRef.current;
    setWordsWritten(Math.max(0, delta));

    // Reset inactivity timer
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(endSession, INACTIVITY_MS);
  }, [isActive, endSession]);

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  return { isActive, sessionStart, wordsWritten, startSession, endSession, recordActivity };
}
