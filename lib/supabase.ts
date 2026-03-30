/**
 * Supabase Client Singleton
 *
 * Creates a single Supabase client instance shared across the app.
 * Returns null when environment variables are missing, enabling
 * graceful degradation to localStorage-only (offline) mode.
 *
 * This pattern allows every hook to check `if (!supabase)` and
 * fall back to local persistence without crashing.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
