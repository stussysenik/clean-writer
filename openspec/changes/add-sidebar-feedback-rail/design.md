## Context

Clean Writer already has several concurrent surfaces:

- desktop syntax panel on the right
- document sidebar on the left
- theme customizer overlay
- help modal overlay

The modal help path is the most avoidable overlap because it duplicates information that can live in a persistent rail. The left sidebar is also structurally wrong on desktop: it is visually a column, but mechanically it still floats on top of the editor.

The product also lacks a dedicated feedback intake path. Users can discover polish issues, layout collisions, or missing flows, but they have nowhere to capture those notes inside the app itself.

## Goals / Non-Goals

**Goals**
- Remove one major overlapping surface from the default writing flow
- Make the desktop sidebar behave like a real column when open
- Add a feedback path that works offline and does not require auth
- Keep the new utility surfaces compact, legible, and easy to revisit

**Non-Goals**
- Rebuild the theme customizer in this slice
- Add admin triage UI for feedback notes
- Replace local document persistence or current Supabase auth flows
- Eliminate every overlay in the product in one pass

## Decisions

### D1: Help moves into the sidebar rail
**Choice**: Replace the centered help modal with a compact guide section inside the left rail.
**Why**: The guide is reference material, not an interruptive workflow. A rail keeps it adjacent to work and avoids covering the document.

### D2: Desktop layout reserves sidebar width
**Choice**: When the desktop sidebar is open, the top bar and main writing area shift right by the sidebar width.
**Why**: This is the smallest change that makes the rail honest. It removes left-side overlap without changing the syntax panel paradigm on the right.

### D3: Feedback lives beside guidance, not in a new popup
**Choice**: Add a second sidebar card for feedback notes with four intents: wish, friction, bug, delight.
**Why**: Users should be able to leave product feedback from the same non-overlapping utility rail. This keeps the mental model simple and avoids another floating form.

### D4: Feedback is local-first with optional remote mirroring
**Choice**: Save notes to localStorage immediately, then mirror to Supabase when configured.
**Why**: Clean Writer is offline-first. Feedback capture should never fail because the network or backend is missing.

## Risks / Trade-offs

- The sidebar becomes denser.
  Mitigation: guide and feedback stay collapsible, and only one utility section expands at a time.

- Mobile still uses a drawer paradigm.
  Mitigation: this slice focuses on removing avoidable desktop overlap first, where there is enough room for a true column.

- Public feedback insertions can attract noise if Supabase is exposed.
  Mitigation: local-first works without Supabase, and remote mirroring is intentionally minimal and isolated to one table.
