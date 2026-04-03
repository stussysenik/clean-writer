-- =============================================================
-- Clean Writer — Public Feedback Notes
-- =============================================================
-- Offline-first notes live in localStorage. When Supabase is
-- configured, the app mirrors them into this table so the team can
-- review requests, friction, and bugs without adding auth friction.
-- =============================================================

create table public.feedback_notes (
  id            uuid primary key,
  kind          text not null
                  check (kind in ('wish', 'friction', 'bug', 'delight')),
  note          text not null,
  contact_email text,
  wants_reply   boolean not null default false,
  source        text not null default 'sidebar',
  context       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

alter table public.feedback_notes enable row level security;

create policy "Anyone can submit feedback notes"
  on public.feedback_notes
  for insert
  with check (true);
