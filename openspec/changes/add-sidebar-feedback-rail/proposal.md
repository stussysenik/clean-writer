## Why

The current shell still breaks the "nothing overlapping" direction in two high-traffic places:

- The help experience is a centered modal that covers the writing area.
- The left sidebar slides over the desktop workspace instead of reserving its own column.

At the same time, there is no structured place for people to leave product notes about friction, wishes, or bugs. That makes iteration slower and raises the cost of human review.

## What Changes

- Reserve real workspace for the left sidebar on desktop so the editor column no longer sits underneath it.
- Replace the centered help modal with a guide section inside the sidebar rail.
- Add a feedback section inside the same rail with low-friction prompts, local-first persistence, and optional Supabase sync.
- Keep feedback visible and recoverable in-app through a recent-notes list instead of hiding it behind a toast-only flow.

## Capabilities

### New Capabilities
- `sidebar-feedback-rail`: A stacked utility rail containing guide and feedback sections without adding another overlay surface
- `feedback-notes`: Local-first feedback capture with optional Supabase mirroring

### Modified Capabilities
- `responsive-device-scaling`: Desktop layout now reserves left-rail space when the sidebar is open

## Impact

- `App.tsx` — reserve desktop space for the rail, route help into the rail, close competing surfaces when needed
- `components/DocumentSidebar/*` — add guide and feedback sections to the sidebar stack
- `hooks/useFeedbackInbox.ts` — feedback persistence and remote mirroring
- `supabase/migrations/002_feedback_notes.sql` — optional remote storage target
- `tests/cypress/specs/*.cy.ts` — update help/accessibility expectations to the new rail behavior
