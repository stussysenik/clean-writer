import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface UseSupabaseReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: "google") => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    await supabase.auth.signUp({ email, password });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signInWithOAuth = useCallback(async (provider: "google") => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signUp, signIn, signInWithOAuth, signOut };
}
