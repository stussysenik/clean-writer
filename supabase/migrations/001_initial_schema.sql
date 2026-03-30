-- =============================================================
-- Clean Writer — Initial Database Schema
-- =============================================================
-- Runs against a fresh Supabase project. Every table uses UUIDs,
-- Row Level Security (RLS), and a shared `updated_at` trigger.
-- =============================================================

-- ─── Helper: auto-update `updated_at` on every UPDATE ────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── Profiles ────────────────────────────────────────────────
-- One row per authenticated user. Mirrors useful auth metadata.
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─── Projects ────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null,
  description text,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects"
  on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects"
  on public.projects for delete using (auth.uid() = user_id);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ─── Documents ───────────────────────────────────────────────
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects on delete set null,
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null,
  content     text not null default '',
  doc_type    text not null default 'standalone'
                check (doc_type in ('chapter', 'standalone', 'scratchpad')),
  position    integer not null default 0,
  word_count  integer not null default 0,
  char_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents"
  on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents"
  on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete their own documents"
  on public.documents for delete using (auth.uid() = user_id);

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

-- ─── Journal Entries ─────────────────────────────────────────
create table public.journal_entries (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users on delete cascade,
  entry_date              date not null,
  content                 text not null default '',
  mood                    text,
  word_count              integer not null default 0,
  char_count              integer not null default 0,
  writing_duration_seconds integer not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (user_id, entry_date)
);

alter table public.journal_entries enable row level security;

create policy "Users can view their own journal entries"
  on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own journal entries"
  on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own journal entries"
  on public.journal_entries for update using (auth.uid() = user_id);
create policy "Users can delete their own journal entries"
  on public.journal_entries for delete using (auth.uid() = user_id);

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.handle_updated_at();

-- ─── Writing Sessions ────────────────────────────────────────
create table public.writing_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  document_id       uuid references public.documents on delete set null,
  journal_entry_id  uuid references public.journal_entries on delete set null,
  started_at        timestamptz not null,
  ended_at          timestamptz,
  words_written     integer not null default 0,
  chars_written     integer not null default 0,
  session_type      text not null default 'freewrite'
                      check (session_type in ('chapter', 'journal', 'freewrite')),
  created_at        timestamptz not null default now()
);

alter table public.writing_sessions enable row level security;

create policy "Users can view their own writing sessions"
  on public.writing_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own writing sessions"
  on public.writing_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own writing sessions"
  on public.writing_sessions for update using (auth.uid() = user_id);
create policy "Users can delete their own writing sessions"
  on public.writing_sessions for delete using (auth.uid() = user_id);

-- ─── User Preferences ───────────────────────────────────────
create table public.user_preferences (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references auth.users on delete cascade,
  theme_id          text,
  font_id           text,
  font_size_offset  integer not null default 0,
  counting_config   jsonb not null default '{}',
  language_mode     text not null default 'en'
                      check (language_mode in ('en', 'ja', 'zh', 'ko', 'auto')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view their own preferences"
  on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert their own preferences"
  on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update their own preferences"
  on public.user_preferences for update using (auth.uid() = user_id);

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.handle_updated_at();
